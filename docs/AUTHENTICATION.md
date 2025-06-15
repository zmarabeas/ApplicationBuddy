# Authentication System Documentation

## Overview

JobFillr uses Firebase for authentication on both the web application and browser extension. The authentication system is designed to handle user sessions across both platforms while maintaining a consistent user experience.

## Authentication Flow

1. **User Registration/Login**: Users can create accounts or log in via:
   - Email/Password authentication
   - Google OAuth (web only, extension redirects to web)

2. **Token Management**: After successful authentication, the system:
   - Obtains a Firebase ID token
   - Stores the token securely (localStorage in web app, chrome.storage in extension)
   - Uses the token for all subsequent API requests

3. **Session Persistence**:
   - Web app: Firebase SDK handles token refresh automatically
   - Extension: Manual token validation and storage management

4. **API Authentication**: All API requests include the Firebase token in the Authorization header

## Technical Implementation

### Web Application

The web application uses React's context API to manage authentication state:

```tsx
// client/src/contexts/AuthContext.tsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const token = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          // Other user properties
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auth functions: login, register, logout, etc.
  
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Browser Extension

The extension uses a combination of background script and popup script to manage authentication:

1. **Background Script**: Manages the persistent auth state
   - Checks for stored auth data on startup
   - Verifies token validity
   - Provides auth state to popup

2. **Popup Script**: Handles UI and user interactions
   - Syncs with background for auth state
   - Displays login/authenticated UI
   - Manages token storage

## Server Authentication

The server authenticates requests using middleware:

```typescript
// server/auth-middleware.ts
export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      firebaseUser: decodedToken
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
```

## Recent Fixes & Improvements

### Session Persistence in Extension

Improved the persistence of authentication state in the browser extension with these key enhancements:

1. **Robust Storage Operations**:
   - Added timeout protection for Chrome storage operations
   - Implemented graceful error handling for storage operations
   - Ensured consistent storage key naming

2. **Better Token Validation**:
   - Added proper token verification on extension startup
   - Implemented automatic cleanup of invalid tokens
   - Added request timeout handling for token verification

3. **Background/Popup Synchronization**:
   - Improved communication between background and popup scripts
   - Added background script state check during popup initialization
   - Implemented fallback mechanisms when background script is unavailable

4. **Error Handling**:
   - Added comprehensive error logging
   - Implemented graceful failure modes
   - Added user-friendly error messages

## Security Considerations

1. **Token Storage**: 
   - Web app: Uses localStorage with appropriate security headers
   - Extension: Uses chrome.storage.local (isolated to extension)

2. **Token Expiration**:
   - Firebase tokens expire after 1 hour by default
   - Web app: Firebase SDK handles refresh automatically
   - Extension: Verifies token validity on startup and before critical operations

3. **Domain Restrictions**:
   - Firebase authentication is configured to only allow specified domains

## Troubleshooting

Common authentication issues and solutions:

1. **"Unauthorized" errors**:
   - Check that the Firebase token is valid and not expired
   - Verify that the Authorization header is properly formatted

2. **Session lost on extension restart**:
   - Check browser console for storage-related errors
   - Verify that chrome.storage operations are completing successfully

3. **Web/Extension auth sync issues**:
   - Ensure the user is logging in with the same account on both platforms
   - Check for CORS issues if the web app and extension are communicating