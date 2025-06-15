import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

// Types for Express session extension
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: number;
        uid: string;
        email: string;
        firebaseUser: admin.auth.DecodedIdToken;
      };
    }
  }
}

// Firebase authentication middleware
export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Allow pre-flight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format:', authHeader);
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.split('Bearer ')[1];
  console.log('Token received, length:', token.length);
  
  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Set user info on the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      firebaseUser: decodedToken
    };
    
    console.log(`Firebase user authenticated: ${req.user.email} (${req.user.uid})`);
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

// Combined auth middleware that tries both Firebase and session auth
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('------------------------------------');
  console.log(`Request to ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? `Present (${authHeader.substring(0, 15)}...)` : 'Missing');
  
  // Try Firebase auth if Authorization header is present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      console.log(`Token found, length: ${token.length}`);
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Firebase token verified successfully:', decodedToken.uid);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        firebaseUser: decodedToken
      };
      
      console.log(`User authenticated via Firebase: ${req.user.email}`);
      return next();
    } catch (error) {
      console.error("Firebase token verification error:", error);
    }
  }
  
  // Fall back to session-based auth
  console.log('Session auth check:', req.session?.user ? 'Session found' : 'No session');
  if (req.session?.user) {
    req.user = {
      id: req.session.user.id,
      uid: '', // Session users don't have Firebase UIDs
      email: req.session.user.email,
      firebaseUser: {} as admin.auth.DecodedIdToken
    };
    console.log(`User authenticated via session: ${req.user.email}`);
    return next();
  }
  
  // No auth method worked
  console.log('Authentication failed: No valid Firebase token or session');
  return res.status(401).json({ message: "Unauthorized" });
};