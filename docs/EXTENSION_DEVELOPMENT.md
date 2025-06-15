# Extension Development Guide

## Overview

The JobFillr browser extension is designed to help users fill out job applications using their stored profile data. This guide explains the extension's architecture, key components, and development considerations.

## Architecture

The extension follows a standard Chrome extension architecture with these components:

1. **Background Script**: Long-running script that maintains state between browser sessions
2. **Popup Script**: Handles the UI when users click the extension icon
3. **Content Script**: Runs in the context of web pages to detect and fill forms
4. **Manifest**: Defines permissions, resources, and extension configuration

## Key Files

- `manifest.json`: Extension configuration
- `background/background.js`: Background script for persistent state
- `popup/popup.html`, `popup/popup.js`, `popup/popup.css`: Popup UI
- `content/content.js`: Content script for form detection and filling
- `config.js`: Shared configuration constants
- `utils/*.js`: Utility functions for API requests, storage, etc.

## Authentication Flow

The extension uses a token-based authentication system:

1. User logs in via the popup UI
2. Token is obtained from the JobFillr API
3. Token is stored in `chrome.storage.local`
4. Token is verified on extension startup
5. Background script manages authentication state

### Session Persistence

The extension implements robust session persistence with:

- Reliable token storage using `chrome.storage.local`
- Token auto-refresh mechanism with periodic validation
- Timeout protection for storage operations
- Graceful error handling for network issues
- Background/popup synchronization
- Browser startup restoration of authentication state

## Development Guidelines

### Adding New Features

1. **Modular Development**: Keep functionality separated between background, popup, and content scripts
2. **Shared State**: Use message passing for communication between components
3. **Error Handling**: Implement proper error handling with user feedback
4. **Storage**: Use the storage utility functions for all persistent data

### Error Handling Best Practices

The extension implements a resilient error handling strategy:

1. **Network Timeouts**: All API requests include timeout protection
2. **Storage Reliability**: Storage operations include fallbacks for failures
3. **Graceful Degradation**: Features gracefully degrade when dependencies are unavailable
4. **User Feedback**: Clear error messages for user-facing issues

### Example: Authentication Check

```javascript
async function checkAuthState() {
  try {
    console.log('Checking authentication state');
    
    // Try to get auth data from storage with improved error handling
    const authData = await getFromStorage('auth');
    
    if (authData && authData.token && authData.user) {
      console.log('Found auth data in storage, verifying token');
      
      // Verify token is still valid with timeout handling
      const isValid = await verifyToken(authData.token);
      
      if (isValid) {
        // Update the in-memory token for future API calls
        authToken = authData.token;
        
        console.log('User is authenticated');
        return { authenticated: true, user: authData.user };
      } else {
        console.warn('Token is invalid or expired, clearing auth data');
        await clearStorage('auth');
      }
    }
    
    // If we get here, user is not authenticated
    return { authenticated: false };
  } catch (error) {
    console.error('Error checking auth state:', error);
    return { authenticated: false, error: error.message };
  }
}
```

## API Integration

The extension communicates with the JobFillr API for:

1. **Authentication**: Login, token verification
2. **Profile Data**: Retrieving user profile for form filling
3. **Form Mapping**: Getting field mappings for specific job sites

### API Request Pattern

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

## Form Detection and Filling

The extension uses a heuristic approach to detect form fields:

1. Scans the page for input elements, select boxes, and textareas
2. Analyzes element attributes and surrounding text to determine field type
3. Calculates confidence score for each detected field
4. Maps fields to user profile data
5. Fills fields with appropriate values

### Planned Form Filling Improvements

The form detection and filling system needs several improvements:

1. **Enhanced Field Mapping**: Improve confidence scoring and field type detection accuracy
2. **Visual Feedback**: Add better UI indicators when fields are detected/filled
3. **Preview Interface**: Create a preview panel to show which data is being used
4. **Field Customization**: Allow users to override detected field mappings
5. **Progress Tracking**: Show completion progress during form filling

### Field Detection Confidence

The system calculates confidence scores based on:

- ID/name/class attribute match quality
- Label text relevance
- Placeholder text relevance
- Field position and grouping

## Testing

For comprehensive testing:

1. **Unit Tests**: Test utility functions in isolation
2. **Integration Tests**: Test popup/background communication
3. **End-to-End Tests**: Test the extension on actual job application sites
4. **Cross-Browser Testing**: Test in Chrome, Firefox (with WebExtensions polyfill), and Edge

## Debugging Tips

1. **Background Script**: Access background script console via chrome://extensions
2. **Content Script**: Inspect page and check console for content script logs
3. **Storage Inspection**: View stored data via chrome.storage API in background console
4. **Network Monitoring**: Use Chrome DevTools network panel to monitor API requests

## Common Issues

1. **Authentication Failures**:
   - Check token storage and retrieval
   - Verify API endpoints are accessible
   - Ensure proper error handling during authentication

2. **Form Detection Problems**:
   - Enable debug logging for confidence scores
   - Check field type detection logic
   - Improve field matching algorithms

3. **Cross-Browser Compatibility**:
   - Use feature detection instead of browser detection
   - Add polyfills for unsupported APIs
   - Test on all target browsers

## Performance Considerations

1. **Storage Usage**: Minimize data stored in chrome.storage
2. **Background Activity**: Limit background script activity to essential tasks
3. **Content Script Performance**: Optimize DOM traversal in form detection
4. **API Caching**: Cache responses where appropriate

## Security Best Practices

1. **Token Storage**: Store tokens in chrome.storage.local (not localStorage)
2. **Content Security Policy**: Define a strict CSP in manifest.json
3. **Minimal Permissions**: Request only necessary permissions
4. **Data Handling**: Clear sensitive data when no longer needed