import { Express, Request, Response } from 'express';
import { storage } from './storage';
import admin from 'firebase-admin';
import { firebaseAuth } from './auth-middleware';
// Import the client side Firebase for custom token generation
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '../client/src/lib/firebase';

// Using a more flexible interface to handle the actual data structure
interface ExtensionProfile {
  profile: any; // Use any to handle the actual profile structure
  workExperiences: any[];
  educations: any[];
}

import { extensionApiLimiter } from './rate-limiter';

/**
 * Register API routes specific for the browser extension
 */
export function registerExtensionRoutes(app: Express) {
  // Apply extension-specific rate limiting to all extension routes
  app.use('/api/extension', extensionApiLimiter);
  // Extension authentication endpoint
  app.post('/api/extension/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Authenticate with Firebase (client)
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Get user from database
      const user = await storage.getUserByFirebaseUID(firebaseUser.uid);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
      }
      
      // Return token and basic user info
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error('Extension login error:', error);
      res.status(401).json({ 
        error: 'Authentication failed',
        message: error.message
      });
    }
  });
  
  // Token verification endpoint - explicitly apply firebaseAuth middleware
  app.post('/api/extension/verify-token', firebaseAuth, async (req: Request, res: Response) => {
    try {
      // The firebaseAuth middleware will already verify the token
      // If we get here, the token is valid and req.user is set
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      console.log('Token verified for user:', req.user.email);
      res.json({ valid: true, uid: req.user.uid });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });
  
  // Get profile data for the extension - explicitly apply firebaseAuth middleware
  app.get('/api/extension/profile', firebaseAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get the user from the database using the Firebase UID
      const user = await storage.getUserByFirebaseUID(req.user.uid);
      
      if (!user || !user.id) {
        return res.status(404).json({ error: 'User not found in database' });
      }
      
      const userId = user.id;
      console.log('Getting profile for user ID:', userId);
      
      // Get profile data
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Get work experiences
      const workExperiences = await storage.getWorkExperiences(profile.id);
      
      // Get education history
      const educations = await storage.getEducations(profile.id);
      
      // Format response for the extension in a flattened structure
      // that matches how the content script expects it
      const extensionProfile = {
        personalInfo: profile.personalInfo || {},
        workExperiences,
        educations,
        skills: profile.skills || []
      };
      
      res.json(extensionProfile);
    } catch (error) {
      console.error('Error getting profile for extension:', error);
      res.status(500).json({ error: 'Failed to get profile data' });
    }
  });
}