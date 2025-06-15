// JobFillr Background Script
// This runs in the background and manages the extension's state

// Import configuration from config.js
import { API_BASE_URL, DEBUG, API_TIMEOUT, VERSION } from '../config.js';

// State
let authToken = null;
let profileData = null;
let tokenRefreshTimer = null;

// Initialize the extension when installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log(`JobFillr extension v${VERSION} installed or updated`);
  
  // Check if the user is already authenticated
  await checkAuthState();
});

// Add listener for when the browser starts up to restore auth state
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started up, checking authentication state');
  await checkAuthState();
});

// Listen for messages from the popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (DEBUG) console.log('Background: Received message:', message.action);
    
    if (message.action === 'login') {
      handleLogin(message.email, message.password)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep the message channel open for async response
    }
    else if (message.action === 'logout') {
      handleLogout()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    else if (message.action === 'getProfileData') {
      fetchProfileData()
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    else if (message.action === 'checkAuthState') {
      checkAuthState()
        .then(state => sendResponse(state))
        .catch(error => sendResponse({ authenticated: false, error: error.message }));
      return true;
    }
    else if (message.action === 'getVersion') {
      sendResponse({ version: VERSION });
      return false;
    }
    else if (message.action === 'formsDetected') {
      // Handle form detection notifications from content script
      if (DEBUG) console.log(`Background: Forms detected on ${message.location}: ${message.formCount} forms`);
      
      // Notify popup if it's open
      try {
        chrome.runtime.sendMessage({
          action: 'updateFormStatus',
          formCount: message.formCount,
          location: message.location
        }).catch(err => {
          // This is expected if popup is not open - not an error
          if (DEBUG) console.log('Background: Could not forward form detection to popup (likely not open)');
        });
      } catch (e) {
        // Ignore errors - popup might not be open
      }
      
      // Acknowledge receipt
      sendResponse({ received: true });
      return false;
    }
    else {
      console.warn('Background: Unknown message action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
      return false;
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error.message });
    return false;
  }
});

// Authentication functions
async function checkAuthState() {
  try {
    if (DEBUG) console.log('Background: Checking authentication state');
    
    // Try to get auth data from storage with improved error handling
    const authData = await getFromStorage('auth');
    
    if (authData && authData.token && authData.user) {
      if (DEBUG) console.log('Background: Found auth data in storage, verifying token');
      
      // Verify token is still valid with timeout handling
      const isValid = await verifyToken(authData.token);
      
      if (isValid) {
        // Update the in-memory token for future API calls
        authToken = authData.token;
        
        if (DEBUG) console.log('Background: User is authenticated');
        
        // Set up token refresh - aim to refresh when token is ~75% through its lifetime
        // Firebase tokens usually last 1 hour, so we'll check every 15 minutes
        setupTokenRefresh(authData.token, authData.user);
        
        // Try to load the profile data in the background
        fetchProfileData().catch(err => {
          console.warn('Background: Failed to load profile data during auth check:', err.message);
        });
        
        return { authenticated: true, user: authData.user };
      } else {
        console.warn('Background: Token is invalid or expired, clearing auth data');
        
        // Clear invalid auth data
        await clearStorage('auth');
        await clearStorage('profile');
      }
    } else {
      if (DEBUG) console.log('Background: No valid authentication data found');
    }
    
    // If we get here, user is not authenticated
    authToken = null;
    return { authenticated: false };
  } catch (error) {
    console.error('Background: Error checking auth state:', error);
    
    // Reset state on error
    authToken = null;
    
    // Make sure we don't leave invalid data in storage
    try {
      await clearStorage('auth');
    } catch (clearError) {
      console.error('Background: Failed to clear auth data after error:', clearError);
    }
    
    return { authenticated: false, error: error.message };
  }
}

async function handleLogin(email, password) {
  try {
    if (DEBUG) console.log('Background: Attempting login for', email);
    
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Background: Login error response:', response.status, errorText);
        throw new Error(`Login failed (${response.status})`);
      }
      
      const { token, user } = await response.json();
      authToken = token;
      
      if (DEBUG) console.log('Background: Login successful');
      
      // Save auth data
      await saveToStorage('auth', { token, user });
      
      // Set up token refresh mechanism
      setupTokenRefresh(token, user);
      
      // Fetch user profile data
      await fetchProfileData();
      
      return { success: true, user };
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Background: Login request timed out after', API_TIMEOUT, 'ms');
        return { success: false, error: 'Login request timed out. Please try again.' };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Background: Login error:', error);
    return { success: false, error: error.message };
  }
}

async function handleLogout() {
  try {
    if (DEBUG) console.log('Background: Logging out user');
    
    // Clear local storage
    await clearStorage('auth');
    await clearStorage('profile');
    
    // Reset state
    authToken = null;
    profileData = null;
    
    // Clear any token refresh timer
    clearTokenRefresh();
    
    return { success: true };
  } catch (error) {
    console.error('Background: Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Token refresh mechanism
function setupTokenRefresh(token, user) {
  // Clear any existing refresh timer
  clearTokenRefresh();
  
  if (DEBUG) console.log('Background: Setting up token refresh timer');
  
  // Firebase tokens typically expire after 1 hour
  // We'll check every 15 minutes (900000ms) to ensure we refresh before expiry
  tokenRefreshTimer = setInterval(async () => {
    try {
      if (DEBUG) console.log('Background: Checking if token needs refresh');
      
      // Check if token is still valid
      const isValid = await verifyToken(token);
      
      if (isValid) {
        if (DEBUG) console.log('Background: Token still valid, no refresh needed');
      } else {
        console.warn('Background: Token is no longer valid, attempting relogin...');
        
        // Token is invalid or expired - we need to get a new one
        // First, try to get login credentials from storage
        const authData = await getFromStorage('auth');
        
        if (!authData || !authData.user || !authData.user.email) {
          console.error('Background: Cannot refresh token - no user data found');
          clearTokenRefresh();
          return;
        }
        
        // Force a check of the auth state - this will try to re-authenticate
        // and either succeed or clear the auth data
        await checkAuthState();
      }
    } catch (error) {
      console.error('Background: Error during token refresh check:', error);
    }
  }, 900000); // Check every 15 minutes
  
  if (DEBUG) console.log('Background: Token refresh timer set');
}

function clearTokenRefresh() {
  if (tokenRefreshTimer) {
    if (DEBUG) console.log('Background: Clearing token refresh timer');
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
}

async function verifyToken(token) {
  try {
    if (DEBUG) console.log('Background: Verifying token...');
    
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
      
      if (DEBUG) console.log('Background: Token verification response:', response.status);
      return response.ok;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Background: Token verification timed out after', API_TIMEOUT, 'ms');
        return false;
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Background: Token verification error:', error);
    return false;
  }
}

// Profile data functions
async function fetchProfileData() {
  try {
    if (DEBUG) console.log('Background: Fetching profile data');
    
    // Check if we need to refresh profile data
    const cachedProfile = await getFromStorage('profile');
    
    if (cachedProfile && cachedProfile.timestamp > Date.now() - (15 * 60 * 1000)) {
      // Use cached data if less than 15 minutes old
      profileData = cachedProfile.data;
      if (DEBUG) console.log('Background: Using cached profile data');
      return profileData;
    }
    
    // Ensure we have a token
    if (!authToken) {
      const authState = await checkAuthState();
      if (!authState.authenticated) {
        throw new Error('Not authenticated');
      }
    }
    
    // Fetch fresh profile data with timeout
    if (DEBUG) console.log('Background: Fetching profile data...');
    
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Background: Profile fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch profile data (${response.status})`);
      }
      
      profileData = await response.json();
      
      // Cache the profile data
      await saveToStorage('profile', {
        data: profileData,
        timestamp: Date.now()
      });
      
      if (DEBUG) console.log('Background: Profile data fetched and cached successfully');
      return profileData;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Background: Profile fetch timed out after', API_TIMEOUT, 'ms');
        throw new Error('Profile data fetch timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Background: Error fetching profile data:', error);
    throw error;
  }
}

// Storage utilities
async function saveToStorage(key, value) {
  if (DEBUG) console.log(`Background: Saving to storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Background: Storage save timeout for key: ${key}`);
      resolve(); // Continue instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.set({ [key]: value }, () => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Background: Storage save error:', chrome.runtime.lastError);
          // Continue instead of rejecting to avoid crashes
          resolve();
        } else {
          if (DEBUG) console.log(`Background: Successfully saved ${key} to storage`);
          resolve();
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Background: Storage save error:', error);
      // Continue instead of rejecting to avoid crashes
      resolve();
    }
  });
}

async function getFromStorage(key) {
  if (DEBUG) console.log(`Background: Getting from storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Background: Storage get timeout for key: ${key}`);
      resolve(null); // Return null instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.get([key], (result) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Background: Storage get error:', chrome.runtime.lastError);
          resolve(null); // Resolve with null instead of rejecting
        } else {
          if (DEBUG) console.log(`Background: Got ${key} from storage:`, result[key] ? 'data found' : 'no data');
          resolve(result[key]);
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Background: Storage get error:', error);
      resolve(null); // Resolve with null instead of rejecting
    }
  });
}

async function clearStorage(key) {
  if (DEBUG) console.log(`Background: Clearing from storage: ${key}`);
  
  return new Promise((resolve, reject) => {
    // Add timeout for Brave compatibility
    const timeoutId = setTimeout(() => {
      console.warn(`Background: Storage clear timeout for key: ${key}`);
      resolve(); // Continue instead of hanging
    }, 2000); // 2 second timeout
    
    try {
      chrome.storage.local.remove([key], () => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          console.error('Background: Storage clear error:', chrome.runtime.lastError);
          // Continue instead of rejecting to avoid crashes
          resolve();
        } else {
          if (DEBUG) console.log(`Background: Successfully cleared ${key} from storage`);
          resolve();
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Background: Storage clear error:', error);
      // Continue instead of rejecting to avoid crashes
      resolve();
    }
  });
}