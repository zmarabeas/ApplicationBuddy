# Browser Extension Integration Guide

This document provides a comprehensive guide on how the JobFillr browser extension integrates with job application websites and the JobFillr backend.

## Table of Contents

1. [Extension Architecture](#extension-architecture)
2. [Integration with Job Sites](#integration-with-job-sites)
3. [Backend Communication](#backend-communication)
4. [Form Detection Algorithm](#form-detection-algorithm)
5. [Security Considerations](#security-considerations)
6. [Troubleshooting](#troubleshooting)
7. [Future Improvements](#future-improvements)

## Extension Architecture

The JobFillr extension follows the standard Chrome extension architecture with these components:

```
extension/
├── manifest.json         # Extension configuration
├── background/
│   └── background.js     # Persistent background script
├── popup/
│   ├── popup.html        # Popup UI HTML
│   ├── popup.js          # Popup functionality
│   └── popup.css         # Popup styling
├── content/
│   └── content.js        # Content script for form detection/filling
├── icons/                # Extension icons
└── utils/                # Shared utility functions
    ├── api.js            # API communication
    └── storage.js        # Chrome storage utilities
```

Each component has a specific role:

1. **Background Script**: Maintains authentication state and handles communication with the backend
2. **Popup Script**: Provides user interface for extension actions
3. **Content Script**: Interacts with web pages to detect and fill forms
4. **Utility Modules**: Provide shared functionality for API requests and storage

## Integration with Job Sites

The extension integrates with job application websites through the content script, which is injected into web pages based on permissions in the manifest.

### Content Script Injection

The content script is injected into pages when:

1. The user navigates to a new page
2. The page is refreshed
3. The extension is installed or updated

For local files (file:// URLs), the extension uses a more aggressive approach with periodic rescanning.

### DOM Interaction

The content script interacts with the page DOM in several ways:

1. **Form Detection**: Scans the page for form elements and input fields
2. **Field Classification**: Analyzes each field to determine its purpose (name, email, etc.)
3. **Form Filling**: Sets values in the detected fields based on user profile data
4. **Visual Feedback**: Highlights fields to indicate successful or failed filling

### DOM Safety Considerations

To ensure stable operation across different websites, the content script implements several safety measures:

1. **Element Validation**: Checks if elements are still connected to the DOM before manipulating them
2. **Error Boundaries**: Wraps DOM operations in try-catch blocks to prevent script failures
3. **Selector-Based References**: Stores selectors instead of direct DOM references to maintain reliability
4. **Mutation Observer**: Monitors DOM changes to detect dynamically loaded forms

## Backend Communication

The extension communicates with the JobFillr backend through a set of dedicated API endpoints.

### Authentication Flow

1. User logs in through the extension popup
2. Extension sends credentials to `/api/extension/login` endpoint
3. Backend validates credentials and returns a JWT token
4. Extension stores the token in Chrome storage
5. Token is included in all subsequent API requests

### Profile Data Retrieval

1. Extension sends authenticated request to `/api/extension/profile` endpoint
2. Backend returns user profile data formatted for the extension
3. Extension stores profile data temporarily for form filling
4. Profile data is cleared when extension is closed

### API Request Pattern

All API requests follow this pattern:

```javascript
async function apiRequest(endpoint, options = {}, operationName = 'API Request') {
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      // Add the signal to the fetch options
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${operationName} failed (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error(`${operationName} timed out after ${API_TIMEOUT}ms`);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`${operationName} error:`, error);
    throw error;
  }
}
```

## Form Detection Algorithm

The form detection algorithm is the core of the extension's functionality. It analyzes web pages to identify form fields and their purposes.

### Detection Process

1. **Scan Page**: Find all forms and input elements on the page
2. **Apply Patterns**: Match elements against predefined patterns for each field type
3. **Calculate Confidence**: Assign confidence scores based on match quality
4. **Detect Labels**: Find associated labels to improve type detection
5. **Filter Results**: Remove low-confidence matches and duplicates

### Field Type Detection

Field types are detected using multiple signals:

1. **Element Attributes**: id, name, placeholder, etc.
2. **Label Text**: Text in associated label elements
3. **Context**: Surrounding elements and parent container
4. **Input Type**: HTML input type attribute

### Confidence Scoring

Confidence scores are calculated based on:

```javascript
function calculateSelectorConfidence(selector, fieldType) {
  // Base confidence
  let confidence = 0.5;
  
  // Adjust based on selector specificity
  if (selector.includes('type=')) {
    confidence += 0.2; // Input types are very specific
  }
  
  if (selector.includes(fieldType.toLowerCase())) {
    confidence += 0.2; // Exact match with field type
  }
  
  if (selector.includes('[name=') || selector.includes('[id=')) {
    confidence += 0.1; // Exact attribute match
  }
  
  return Math.min(confidence, 0.9); // Cap at 0.9 for selectors
}

function calculateLabelConfidence(labelText, patterns) {
  let maxConfidence = 0;
  
  patterns.forEach((pattern, index) => {
    if (pattern.test(labelText)) {
      // First patterns are more specific, so they get higher confidence
      const confidence = 0.5 + (0.5 / (index + 1));
      maxConfidence = Math.max(maxConfidence, confidence);
    }
  });
  
  return maxConfidence;
}
```

### Field Mapping

Detected fields are mapped to user profile data using the field type:

```javascript
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
    case 'email':
      return personalInfo.email;
    // ... other field mappings
  }
}
```

## Security Considerations

### Data Storage

1. **Token Storage**: Authentication tokens are stored in `chrome.storage.local` (not localStorage)
2. **Profile Data**: Profile data is temporarily stored in memory during form filling
3. **Sensitive Information**: All data transmission uses HTTPS

### Permission Model

The extension uses a minimal permission model:

```json
"permissions": [
  "storage",
  "activeTab"
],
"host_permissions": [
  "https://api.jobfillr.com/*",
  "https://*/*",
  "file:///*"
]
```

### Token Handling

1. **Token Verification**: Tokens are verified with the backend before use
2. **Token Refresh**: Tokens are automatically refreshed when needed
3. **Token Revocation**: Tokens are removed on logout

## Troubleshooting

### Common Issues

1. **Form Detection Problems**:
   - Symptom: Fields not detected properly
   - Solutions:
     - Check if content script is loaded (see console logs)
     - Try refreshing the page
     - Use the 'Scan Page' button in the popup
     - Inspect field patterns in developer tools

2. **Form Filling Issues**:
   - Symptom: Detected fields but values not filled
   - Solutions:
     - Verify profile data is loaded
     - Check browser console for errors
     - Check if fields are protected against programmatic input
     - Try manual filling for problematic fields

3. **Authentication Problems**:
   - Symptom: Repeatedly asked to log in
   - Solutions:
     - Check if third-party cookies are blocked
     - Clear extension storage and try again
     - Verify backend API is accessible

### Debugging Tools

1. **Background Console**: Access via chrome://extensions > Inspect views: background page
2. **Content Console**: Access via browser DevTools on the target page
3. **Storage Inspector**: View storage via chrome.storage API in background console

## Future Improvements

1. **Machine Learning-Based Detection**:
   - Train a model on job application forms
   - Use ML to improve field type classification
   - Implement feedback loop from user corrections

2. **Enhanced Visual Feedback**:
   - Add preview panel for field mappings
   - Provide interactive corrections interface
   - Show completion status with progress meter

3. **Cross-Browser Support**:
   - Port to Firefox using WebExtensions API
   - Support Safari with extension conversion
   - Use browser-specific storage adapters

4. **Advanced Form Handling**:
   - Support multi-page forms
   - Handle complex inputs (dropdowns, multi-selects)
   - Support custom field mappings defined by users

5. **Privacy Enhancements**:
   - Add options to exclude sensitive data
   - Implement local-only mode for privacy-focused users
   - Add optional encryption for stored data