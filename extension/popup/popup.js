// Import configuration
import { API_BASE_URL, WEB_APP_URL, API_TIMEOUT, DEBUG, VERSION } from '../config.js';

// For debugging purposes only - output the API URL to the console
console.log('Extension connecting to API at:', API_BASE_URL);

// Listen for form detection notifications from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    // Handle direct form detection notifications from content script
    if (message.action === 'formsDetected' && message.formCount > 0) {
      console.log(`Popup: Received notification about ${message.formCount} detected fields on ${message.location}`);
      
      // If popup is open and DOM is ready
      if (document.readyState === 'complete') {
        // First try to get the proper DOM reference if needed
        const formContainer = document.getElementById('form-detected');
        
        if (formContainer && formContainer.classList.contains('hidden')) {
          // Automatically scan if not already showing form fields
          console.log('Popup: Auto-triggering scan after form detection notification');
          scanCurrentPage();
        }
      }
      
      // Acknowledge receipt
      sendResponse({ received: true });
    }
    // Handle form status updates forwarded from background script
    else if (message.action === 'updateFormStatus') {
      console.log(`Popup: Received form status update: ${message.formCount} fields on ${message.location}`);
      
      // If popup is open and DOM is ready
      if (document.readyState === 'complete') {
        // Update UI to reflect detected forms
        const formContainer = document.getElementById('form-detected');
        const noFormContainer = document.getElementById('no-form-detected');
        const fieldCountEl = document.getElementById('field-count');
        
        if (message.formCount > 0 && formContainer && noFormContainer && fieldCountEl) {
          // Show form detected section
          formContainer.classList.remove('hidden');
          noFormContainer.classList.add('hidden');
          
          // Update field count
          fieldCountEl.textContent = message.formCount;
          
          // Trigger a scan if needed
          console.log('Popup: Auto-triggering scan after form status update');
          scanCurrentPage();
        }
      }
      
      // Acknowledge receipt
      if (sendResponse) sendResponse({ received: true });
    }
  } catch (error) {
    console.error('Error handling message in popup:', error);
  }
  
  return true; // Keep the channel open for async response
});

// DOM Elements - we'll get references to these after the DOM is loaded
let loginView;
let appView;
let loggedOutView;
let loggedInView;
let loadingOverlay;
let loadingText;
let toastContainer;
let userEmailElement;
let loginForm;
let emailInput;
let passwordInput;
let loginButton;
let logoutButton;
let googleSigninButton;
let scanPageButton;
let fillFormButton;
let noFormDetected;
let formDetected;
let fieldCount;
let fieldsContainer;
let fieldsList;
let fieldsSummary;
let highConfidenceCount;
let mediumConfidenceCount;
let lowConfidenceCount;
let openWebApp;
let openSettings;
let openHelp;
let openProfile;

// This function will be called once to get DOM references 
function getDOMReferences() {
  loginView = document.getElementById('login-view');
  appView = document.getElementById('app-view');
  loggedOutView = document.querySelector('.logged-out-view');
  loggedInView = document.querySelector('.logged-in-view');
  loadingOverlay = document.getElementById('loading-overlay');
  loadingText = document.getElementById('loading-text');
  toastContainer = document.getElementById('toast-container');
  userEmailElement = document.getElementById('user-email');
  loginForm = document.getElementById('login-form');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  loginButton = document.getElementById('login-btn');
  logoutButton = document.getElementById('logout-btn');
  googleSigninButton = document.getElementById('google-signin-btn');
  scanPageButton = document.getElementById('scan-page-btn');
  fillFormButton = document.getElementById('fill-form-btn');
  noFormDetected = document.getElementById('no-form-detected');
  formDetected = document.getElementById('form-detected');
  fieldCount = document.getElementById('field-count');
  fieldsContainer = document.getElementById('fields-container');
  fieldsList = document.getElementById('fields-list');
  fieldsSummary = document.getElementById('fields-summary');
  highConfidenceCount = document.getElementById('high-confidence-count');
  mediumConfidenceCount = document.getElementById('medium-confidence-count');
  lowConfidenceCount = document.getElementById('low-confidence-count');
  openWebApp = document.getElementById('open-web-app');
  openSettings = document.getElementById('open-settings');
  openHelp = document.getElementById('open-help');
  openProfile = document.getElementById('open-profile');
}

// State
let currentUser = null;
let authToken = null;
let profileData = null;
let detectedFields = [];

// Initialize the extension
document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('JobFillr Extension v' + VERSION + ' initializing...');
  
  try {
    console.log('Getting DOM references');
    // First get references to all DOM elements
    getDOMReferences();
    
    console.log('DOM elements check:');
    console.log('- loadingOverlay:', loadingOverlay ? 'found' : 'missing');
    console.log('- loginView:', loginView ? 'found' : 'missing');
    console.log('- appView:', appView ? 'found' : 'missing');
    console.log('- loginForm:', loginForm ? 'found' : 'missing');
    
    // Critical fix: Force-hide loading overlay immediately with both class and style
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    
    // Setup event listeners once DOM elements are available
    setupEventListeners();
    
    // Try to restore previous session - Improved version with proper error handling and background sync
    console.log('Checking for saved authentication...');
    showLoading('Loading your profile...');
    
    // Use async/await with Promise wrapper for better error handling
    (async () => {
      try {
        console.log('First checking with background script for current auth state');
        // First try to get authentication state from the background script
        // This helps to keep popup and background auth states in sync
        const backgroundAuthState = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'checkAuthState' }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn('Error communicating with background:', chrome.runtime.lastError);
              resolve(null);
            } else {
              resolve(response);
            }
          });
        });
        
        // Check if background script has valid auth state
        if (backgroundAuthState && backgroundAuthState.authenticated && backgroundAuthState.user) {
          console.log('Background script reports user is authenticated');
          
          // Get the token from storage
          const authData = await getFromStorage('auth');
          
          if (authData && authData.token) {
            console.log('Found matching token in storage, restoring session');
            
            // Restore the session
            setAuthenticatedUser(backgroundAuthState.user, authData.token);
            
            try {
              // Fetch profile data in the background
              await fetchProfileData();
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              // Continue with authenticated session even if profile fetch fails
            }
            
            hideLoading();
            return; // Exit early as we successfully restored the session
          } else {
            console.warn('Background reports authenticated but no token in storage');
            // Will fall through to local storage check
          }
        } else {
          console.log('Background script reports not authenticated or not available');
        }
        
        // Fallback to checking local storage directly
        console.log('Falling back to local storage check');
        const authData = await getFromStorage('auth');
        
        if (authData && authData.token && authData.user) {
          console.log('Found saved authentication data, validating token...');
          
          // Verify the token is still valid
          const isValid = await verifyToken(authData.token);
          
          if (isValid) {
            console.log('Saved token is valid, restoring session');
            
            // Restore the session
            setAuthenticatedUser(authData.user, authData.token);
            
            try {
              // Fetch profile data in the background
              await fetchProfileData();
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              // Continue with authenticated session even if profile fetch fails
            }
          } else {
            console.log('Saved token is no longer valid, clearing auth data');
            setUnauthenticatedUser();
          }
        } else {
          console.log('No valid saved session found');
          setUnauthenticatedUser();
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        setUnauthenticatedUser();
      } finally {
        hideLoading();
      }
    })();
    
    console.log('Extension initialization complete');
  } catch (error) {
    console.error('ERROR DURING INITIALIZATION:', error);
    
    // Emergency fallback for critical UI elements
    try {
      // Direct DOM manipulation as a last resort
      console.log('Attempting emergency UI fix');
      const loadingEl = document.getElementById('loading-overlay');
      if (loadingEl) {
        loadingEl.classList.add('hidden');
        loadingEl.style.display = 'none';
      }
      
      const loginViewEl = document.getElementById('login-view');
      if (loginViewEl) loginViewEl.classList.remove('hidden');
      
      const appViewEl = document.getElementById('app-view');
      if (appViewEl) appViewEl.classList.add('hidden');
      
      const loggedOutEl = document.querySelector('.logged-out-view');
      if (loggedOutEl) loggedOutEl.classList.remove('hidden');
      
      const loggedInEl = document.querySelector('.logged-in-view');
      if (loggedInEl) loggedInEl.classList.add('hidden');
    } catch (e) {
      console.error('Failed to fix UI after error:', e);
    }
  }
}

function setupEventListeners() {
  // Authentication events
  loginForm.addEventListener('submit', handleLogin);
  loginButton.addEventListener('click', () => {
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
  });
  logoutButton.addEventListener('click', handleLogout);
  googleSigninButton.addEventListener('click', handleGoogleSignin);
  
  // Application events
  scanPageButton.addEventListener('click', scanCurrentPage);
  fillFormButton.addEventListener('click', fillForm);
  
  // Navigation events
  openWebApp.addEventListener('click', () => openTab(`${WEB_APP_URL}/register`));
  openSettings.addEventListener('click', () => openTab(`${WEB_APP_URL}/settings`));
  openHelp.addEventListener('click', () => openTab(`${WEB_APP_URL}/help`));
  openProfile.addEventListener('click', () => openTab(`${WEB_APP_URL}/profile`));
}

function openTab(url) {
  chrome.tabs.create({ url });
}

// Authentication functions
async function checkAuthStatus() {
  showLoading('Checking authentication status...');
  
  // Set a failsafe timeout in case anything goes wrong
  const failsafeTimeout = setTimeout(() => {
    console.warn('Popup: Authentication check timed out (failsafe triggered)');
    setUnauthenticatedUser();
    hideLoading();
    showMessage('Authentication check timed out', 'warning');
  }, 5000); // 5 second maximum
  
  try {
    if (DEBUG) console.log('Popup: Checking authentication status');
    
    // Try to get auth data from storage with built-in timeout
    const authData = await getFromStorage('auth');
    
    // Make sure we have valid auth data
    if (authData && authData.token && authData.user) {
      if (DEBUG) console.log('Popup: Auth data found, verifying token...');
      
      // Verify token is still valid with built-in timeout
      const isValid = await verifyToken(authData.token);
      
      if (isValid) {
        if (DEBUG) console.log('Popup: Token is valid, setting authenticated user');
        clearTimeout(failsafeTimeout);
        setAuthenticatedUser(authData.user, authData.token);
        hideLoading();
        return;
      } else {
        console.warn('Popup: Token verification failed');
      }
    } else {
      if (DEBUG) console.log('Popup: No auth data found');
    }
    
    // If we get here, user is not authenticated
    if (DEBUG) console.log('Popup: Setting unauthenticated state');
    clearTimeout(failsafeTimeout);
    setUnauthenticatedUser();
  } catch (error) {
    console.error('Popup: Error checking auth status:', error);
    clearTimeout(failsafeTimeout);
    setUnauthenticatedUser();
    showMessage('Authentication check failed', 'error');
  } finally {
    clearTimeout(failsafeTimeout);
    hideLoading();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showMessage('Please enter email and password', 'warning');
    return;
  }
  
  showLoading('Signing in...');
  console.log(`Login attempt for email: ${email}`);
  
  // Set a backup timeout for the entire login process
  const loginTimeout = setTimeout(() => {
    console.warn('Login process timed out (safety timeout)');
    hideLoading();
    showMessage('Login process timed out. Please try again.', 'error');
    setUnauthenticatedUser();
  }, 10000); // 10 second maximum for the entire process
  
  try {
    // Create an AbortController to handle fetch timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    console.log(`Sending login request to ${API_BASE_URL}/api/extension/login`);
    
    try {
      // Step 1: Login request
      console.log('Step 1: Sending login request');
      const response = await fetch(`${API_BASE_URL}/api/extension/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check for HTTP error responses
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Login failed (${response.status})`;
        } catch (e) {
          errorMessage = `Login failed with status ${response.status}`;
        }
        
        console.error('Login error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const result = await response.json();
      console.log('Login response received, token length:', result.token?.length || 0);
      
      if (!result.token || !result.user) {
        throw new Error('Invalid response from server (missing token or user)');
      }
      
      // Success! Clear the global timeout and set up authenticated state
      clearTimeout(loginTimeout);
      console.log('Authentication successful for:', result.user.email);
      
      // Set up the authenticated user state (in-memory only)
      setAuthenticatedUser(result.user, result.token);
      
      // Step 2: Fetch profile data if login was successful
      showLoading('Loading your profile...');
      console.log('Step 2: Fetching profile data');
      
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/api/extension/profile`, {
          headers: {
            'Authorization': `Bearer ${result.token}`
          },
          // Use a new AbortController
          signal: (new AbortController()).signal
        });
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('Profile data loaded successfully');
        } else {
          console.warn('Profile data fetch returned status:', profileResponse.status);
          // Continue without profile data
        }
      } catch (profileError) {
        console.error('Profile data fetch error:', profileError);
        // Not critical, will attempt to fetch profile again when needed
      }
      
      // Complete the login process
      hideLoading();
      showMessage('Successfully signed in!', 'success');
      
      // Step 3: Scan the current page
      console.log('Step 3: Scanning current page for form fields');
      scanCurrentPage();
      
    } catch (fetchError) {
      clearTimeout(loginTimeout);
      
      if (fetchError.name === 'AbortError') {
        console.error('Login request timed out after', API_TIMEOUT, 'ms');
        showMessage('Login request timed out. Check your network connection.', 'error');
      } else {
        console.error('Login error:', fetchError.message);
        showMessage(fetchError.message || 'Login failed. Please check your credentials.', 'error');
      }
      
      setUnauthenticatedUser();
      hideLoading();
    }
  } catch (error) {
    clearTimeout(loginTimeout);
    console.error('Unexpected error during login:', error);
    showMessage('An unexpected error occurred. Please try again.', 'error');
    setUnauthenticatedUser();
    hideLoading();
  }
}

function handleGoogleSignin() {
  // For the prototype, redirect to web app for Google auth
  openTab(`${WEB_APP_URL}/login?extension=true`);
  
  // In a real implementation, we would use chrome.identity API for Google auth
  // This would require additional permissions and setup
}

async function handleLogout() {
  // Just reset in-memory state - we're not relying on storage anymore
  console.log('Logging out user');
  setUnauthenticatedUser();
  showMessage('You have been logged out', 'info');
}

function setAuthenticatedUser(user, token) {
  currentUser = user;
  authToken = token;
  
  // Save auth data to chrome storage for persistent login
  try {
    // Save auth data as a combined object under 'auth' key
    saveToStorage('auth', { token, user }).then(() => {
      console.log('Auth data saved to storage for persistent login');
    }).catch(err => {
      console.error('Error saving auth data to storage:', err);
    });
  } catch (e) {
    console.error('Error saving auth data to storage:', e);
  }
  
  // Update UI
  userEmailElement.textContent = user.email;
  loggedOutView.classList.add('hidden');
  loggedInView.classList.remove('hidden');
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
}

function setUnauthenticatedUser() {
  // Reset in-memory state
  currentUser = null;
  authToken = null;
  profileData = null;
  
  // Clear stored auth data using our utility function with better error handling
  clearStorage('auth')
    .then(() => {
      console.log('Auth data cleared from storage successfully');
    })
    .catch(err => {
      console.error('Error clearing auth data:', err);
      // Continue with logout process even if storage clear fails
    });
  
  // Also clear any cached profile data
  clearStorage('profile')
    .then(() => {
      console.log('Profile data cleared from storage');
    })
    .catch(err => {
      console.error('Error clearing profile data:', err);
    });
  
  // Update UI immediately (don't wait for storage operations)
  loggedOutView.classList.remove('hidden');
  loggedInView.classList.add('hidden');
  loginView.classList.remove('hidden');
  appView.classList.add('hidden');
}

async function verifyToken(token) {
  try {
    if (DEBUG) console.log('Verifying token...');
    
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (DEBUG) console.log('Token verification response:', response.status);
      return response.ok;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Token verification timed out after', API_TIMEOUT, 'ms');
        showMessage('Authentication check timed out', 'error');
        return false;
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Profile data functions - simplified to only use in-memory state
async function fetchProfileData() {
  if (!authToken) {
    console.error('Cannot fetch profile: No auth token available');
    return;
  }

  // No loading indicator needed if already showing one from the caller
  const isAlreadyLoading = !loadingOverlay.classList.contains('hidden');
  if (!isAlreadyLoading) {
    showLoading('Fetching your profile data...');
  }
  
  try {
    console.log('Fetching profile data from API...');
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        profileData = await response.json();
        console.log('Profile data fetched successfully');
        return profileData;
      } else {
        console.error('Profile fetch error:', response.status);
        showMessage('Failed to load profile data. Please try again.', 'error');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Profile fetch timed out after', API_TIMEOUT, 'ms');
        showMessage('Profile data fetch timed out', 'error');
      } else {
        console.error('Profile fetch error:', fetchError);
        showMessage('Failed to load profile data. Please try again.', 'error');
      }
    }
  } catch (error) {
    console.error('Error in fetchProfileData:', error);
    showMessage('Failed to load profile data', 'error');
  } finally {
    // Hide loading unless the caller is managing it
    if (!isAlreadyLoading) {
      hideLoading();
    }
  }
}

// Form detection and filling functions
function scanCurrentPage() {
  showLoading('Scanning page for form fields...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      hideLoading();
      showMessage('No active tab found', 'error');
      return;
    }
    
    const activeTab = tabs[0];
    
    chrome.tabs.sendMessage(
      activeTab.id, 
      { action: 'scanPage' },
      (response) => {
        hideLoading();
        handleScanResults(response);
      }
    );
    
    // Set a timeout in case content script doesn't respond
    setTimeout(() => {
      hideLoading();
      if (!detectedFields.length) {
        showMessage('Scan timed out or extension not active on this page', 'warning');
        showNoFormDetected();
      }
    }, 5000);
  });
}

function handleScanResults(response) {
  if (!response) {
    showNoFormDetected();
    showMessage('No response from content script. Make sure you\'re on a job application page.', 'warning');
    return;
  }
  
  if (response.error) {
    showNoFormDetected();
    showMessage(`Error scanning page: ${response.error}`, 'error');
    console.error('Scan error:', response.error);
    return;
  }
  
  detectedFields = response.fields || [];
  
  if (detectedFields.length === 0) {
    showNoFormDetected();
    showMessage('No form fields detected on this page', 'info');
    return;
  }
  
  showFormDetected(detectedFields);
  showMessage(`Found ${detectedFields.length} fillable fields!`, 'success');
}

function showNoFormDetected() {
  noFormDetected.classList.remove('hidden');
  formDetected.classList.add('hidden');
  fieldsContainer.classList.add('hidden');
  fillFormButton.disabled = true;
}

function showFormDetected(fields) {
  noFormDetected.classList.add('hidden');
  formDetected.classList.remove('hidden');
  fieldsContainer.classList.remove('hidden');
  fillFormButton.disabled = false;
  
  fieldCount.textContent = fields.length;
  
  // Clear field list and confidence counts
  fieldsList.innerHTML = '';
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  // Add value mapping to each field
  fields.forEach(field => {
    // Add display value (what will be filled)
    if (profileData) {
      field.mappedValue = getValueForField(field.fieldType);
    }
    
    // Determine confidence level
    if (field.confidence >= 0.8) {
      highCount++;
    } else if (field.confidence >= 0.5) {
      mediumCount++;
    } else {
      lowCount++;
    }
  });
  
  // Update confidence counts in the summary
  highConfidenceCount.textContent = highCount;
  mediumConfidenceCount.textContent = mediumCount;
  lowConfidenceCount.textContent = lowCount;
  
  // Sort fields by confidence (highest first)
  const sortedFields = [...fields].sort((a, b) => b.confidence - a.confidence);
  
  // Create field items
  sortedFields.forEach(field => {
    const fieldItem = document.createElement('div');
    
    const confidenceClass = 
      field.confidence >= 0.8 ? 'high' : 
      field.confidence >= 0.5 ? 'medium' : 
      'low';
    
    fieldItem.className = `field-item ${confidenceClass}`;
    
    // Get confidence description
    const confidenceDesc = 
      field.confidence >= 0.8 ? 'High confidence match' : 
      field.confidence >= 0.5 ? 'Medium confidence match' : 
      'Low confidence match, may not be accurate';
    
    // Create value description
    const valueDesc = field.mappedValue ? 
      `Will fill with: <strong>${truncateText(field.mappedValue, 40)}</strong>` : 
      'No matching data available in your profile';
    
    // Get tooltip content
    const tooltipContent = `
      <strong>Field Type:</strong> ${field.fieldType || field.fieldName}<br>
      <strong>Confidence:</strong> ${confidenceDesc}<br>
      ${valueDesc}
    `;
    
    // Set field match class based on whether we have a value
    const fieldMatchClass = field.mappedValue ? 'field-match filled' : 'field-match';
    
    fieldItem.innerHTML = `
      <div class="field-name">${field.fieldName}</div>
      <div class="${fieldMatchClass}">${truncateText(field.mappedValue || 'No data', 20)}</div>
      <div class="field-info confidence ${confidenceClass}">
        ${Math.round(field.confidence * 100)}%
        <div class="tooltip tooltip-wide">${tooltipContent}</div>
      </div>
    `;
    
    fieldsList.appendChild(fieldItem);
  });
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper function to get the value for a field from the profile data
function getValueForField(fieldType) {
  if (!profileData) return null;
  
  const personalInfo = profileData.personalInfo || {};
  const workExperiences = profileData.workExperiences || [];
  const educations = profileData.educations || [];
  const skills = profileData.skills || [];
  
  // Get most recent work experience
  const currentJob = workExperiences.length > 0 ? workExperiences[0] : null;
  
  // Get most recent education
  const recentEducation = educations.length > 0 ? educations[0] : null;
  
  switch (fieldType) {
    case 'firstName':
      return personalInfo.firstName;
    case 'lastName':
      return personalInfo.lastName;
    case 'fullName':
      return personalInfo.firstName && personalInfo.lastName
        ? `${personalInfo.firstName} ${personalInfo.lastName}`
        : null;
    case 'email':
      return personalInfo.email;
    case 'phone':
      return personalInfo.phone;
    case 'address':
      return personalInfo.address?.street;
    case 'city':
      return personalInfo.address?.city;
    case 'state':
      return personalInfo.address?.state;
    case 'zipCode':
      return personalInfo.address?.zip;
    case 'country':
      return personalInfo.address?.country;
    case 'linkedin':
      return personalInfo.links?.linkedin;
    case 'github':
      return personalInfo.links?.github;
    case 'portfolio':
      return personalInfo.links?.portfolio;
    case 'currentCompany':
      return currentJob?.company;
    case 'currentPosition':
      return currentJob?.title;
    case 'yearsOfExperience':
      // Calculate total years of experience
      if (workExperiences.length === 0) return null;
      
      let totalMonths = 0;
      workExperiences.forEach(job => {
        if (job.startDate) {
          const start = new Date(job.startDate);
          const end = job.endDate ? new Date(job.endDate) : new Date();
          
          // Calculate months between dates
          totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth());
        }
      });
      
      return Math.round(totalMonths / 12).toString();
    case 'education':
      if (!recentEducation) return null;
      return `${recentEducation.degree || ''} in ${recentEducation.field || ''} from ${recentEducation.institution || ''}`;
    case 'degree':
      return recentEducation?.degree;
    case 'school':
      return recentEducation?.institution;
    case 'field':
      return recentEducation?.field;
    case 'skills':
      return skills.join(', ');
    default:
      return null;
  }
}

function fillForm() {
  if (!profileData) {
    showMessage('Profile data not loaded. Please try logging in again.', 'error');
    return;
  }
  
  if (!detectedFields || detectedFields.length === 0) {
    showMessage('No fields detected. Please scan the page first.', 'warning');
    return;
  }
  
  showLoading('Filling form fields...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      hideLoading();
      showMessage('No active tab found', 'error');
      return;
    }
    
    const activeTab = tabs[0];
    
    chrome.tabs.sendMessage(
      activeTab.id, 
      { 
        action: 'fillForm',
        profileData: profileData,
        fields: detectedFields
      },
      (response) => {
        hideLoading();
        
        if (response && response.success) {
          const filledCount = response.filledCount || 0;
          const skippedCount = response.skippedCount || 0;
          const errorCount = response.errorCount || 0;
          const totalFields = response.totalFields || 0;
          
          if (filledCount > 0) {
            // Show success message with details
            const details = [];
            if (skippedCount > 0) details.push(`${skippedCount} skipped`);
            if (errorCount > 0) details.push(`${errorCount} failed`);
            
            const detailsText = details.length > 0 ? ` (${details.join(', ')})` : '';
            showMessage(`Successfully filled ${filledCount} of ${totalFields} fields${detailsText}!`, 'success');
            
            // Mark form fields in the UI with their new filled status
            updateFieldsWithFilledStatus(response.results);
          } else {
            if (skippedCount > 0 && errorCount === 0) {
              showMessage(`No fields were filled, ${skippedCount} were skipped due to missing data.`, 'warning');
            } else if (errorCount > 0) {
              showMessage(`Failed to fill ${errorCount} fields. Please try scanning again.`, 'error');
            } else {
              showMessage('No fields were filled. Try scanning again.', 'info');
            }
          }
        } else {
          showMessage('Failed to fill form. Please try again.', 'error');
          console.error('Fill error:', response?.error || 'No response');
        }
      }
    );
    
    // Set a timeout in case content script doesn't respond
    setTimeout(() => {
      hideLoading();
    }, 5000);
  });
}

// Storage utilities
async function saveToStorage(key, value) {
  if (DEBUG) console.log(`Popup: Saving to storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Popup: Storage save timeout for key: ${key}`);
      resolve(); // Continue instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.set({ [key]: value }, () => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Storage save error:', chrome.runtime.lastError);
          resolve(); // Continue instead of rejecting
        } else {
          if (DEBUG) console.log(`Popup: Successfully saved ${key} to storage`);
          resolve();
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Storage save error:', error);
      resolve(); // Continue instead of rejecting
    }
  });
}

async function getFromStorage(key) {
  if (DEBUG) console.log(`Popup: Getting from storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Popup: Storage get timeout for key: ${key}`);
      resolve(null); // Return null instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.get([key], (result) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Storage get error:', chrome.runtime.lastError);
          resolve(null); // Resolve with null instead of rejecting
        } else {
          if (DEBUG) console.log(`Popup: Got ${key} from storage:`, result[key] ? 'data found' : 'no data');
          resolve(result[key]);
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Storage get error:', error);
      resolve(null); // Resolve with null instead of rejecting
    }
  });
}

async function clearStorage(key) {
  if (DEBUG) console.log(`Popup: Clearing from storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Popup: Storage clear timeout for key: ${key}`);
      resolve(); // Continue instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.remove([key], () => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Storage clear error:', chrome.runtime.lastError);
          resolve(); // Continue instead of rejecting
        } else {
          if (DEBUG) console.log(`Popup: Successfully cleared ${key} from storage`);
          resolve();
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Storage clear error:', error);
      resolve(); // Continue instead of rejecting
    }
  });
}

// UI utilities
function showMessage(message, type = 'info') {
  console.log(`[${type}] ${message}`);
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showLoading(message = 'Loading...') {
  try {
    // First check if references are available
    if (!loadingOverlay || !loadingText) {
      console.warn('Loading elements not available, trying direct access');
      const overlayElement = document.getElementById('loading-overlay');
      const textElement = document.getElementById('loading-text');
      
      if (overlayElement && textElement) {
        textElement.textContent = message;
        overlayElement.classList.remove('hidden');
        overlayElement.style.display = 'flex'; // Ensure it's visible with flex display
      } else {
        console.error('Failed to show loading: Elements not found');
      }
      return;
    }
    
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
    loadingOverlay.style.display = 'flex'; // Ensure it's visible with flex display
    console.log(`Loading started: ${message}`);
  } catch (error) {
    console.error('Error showing loading:', error);
  }
}

function hideLoading() {
  try {
    // Try to get the overlay element either from reference or directly
    const overlay = loadingOverlay || document.getElementById('loading-overlay');
    
    if (overlay) {
      // Double ensure it's hidden
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
      console.log('Loading hidden successfully');
    } else {
      console.warn('Loading overlay not found for hiding');
      
      // Try direct DOM manipulation as final fallback
      const element = document.getElementById('loading-overlay');
      if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error hiding loading:', error);
    
    // Last resort - try the most direct approach possible
    try {
      const element = document.getElementById('loading-overlay');
      if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
      }
    } catch (e) {
      // Nothing more we can do
    }
  }
}

// Update the field items in the UI to reflect their filled status
function updateFieldsWithFilledStatus(results) {
  if (!results || !Array.isArray(results) || !fieldsList) return;
  
  // Get all field items
  const fieldItems = fieldsList.querySelectorAll('.field-item');
  if (!fieldItems.length) return;
  
  // Create map of field types to results
  const resultsMap = new Map();
  results.forEach(result => {
    if (result.fieldType) {
      resultsMap.set(result.fieldType, result);
    }
  });
  
  // Update each field item
  Array.from(fieldItems).forEach(item => {
    // Get the field type from the first div (field-name)
    const fieldNameEl = item.querySelector('.field-name');
    if (!fieldNameEl) return;
    
    // Find the field name and match it to a field type
    const fieldName = fieldNameEl.textContent.trim();
    const fieldType = Object.keys(getReadableFieldNamesMap()).find(
      type => getReadableFieldNamesMap()[type] === fieldName
    );
    
    if (!fieldType) return;
    
    // Get the result for this field type
    const result = resultsMap.get(fieldType);
    if (!result) return;
    
    // Update the field item based on the result
    const fieldMatchEl = item.querySelector('.field-match');
    if (fieldMatchEl) {
      if (result.status === 'filled') {
        fieldMatchEl.classList.add('filled');
        fieldMatchEl.title = 'Successfully filled';
        fieldMatchEl.textContent = truncateText(result.value || 'Filled', 20);
      } else if (result.status === 'skipped') {
        fieldMatchEl.textContent = `Skipped: ${result.reason || 'Unknown reason'}`;
        fieldMatchEl.style.color = '#f59e0b';
      } else if (result.status === 'error') {
        fieldMatchEl.textContent = 'Error';
        fieldMatchEl.style.color = '#ef4444';
      }
    }
  });
}

// Helper function to get the map of field types to readable names
function getReadableFieldNamesMap() {
  return {
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'Zip Code',
    country: 'Country',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    currentCompany: 'Current Company',
    currentPosition: 'Current Position',
    yearsOfExperience: 'Years of Experience',
    education: 'Education',
    degree: 'Degree',
    school: 'School',
    field: 'Field of Study',
    skills: 'Skills'
  };
}