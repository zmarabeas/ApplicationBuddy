import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { auth } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { storage } from './storage';
import { processResumeFile } from './resumeProcessor';
import { parseResumeWithAI } from './openai';
import { seedTemplates } from './seed-templates';
import { db } from './db';
import { createViteServer } from './vite';
import type { ViteDevServer } from 'vite';
import type { Express, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { 
  personalInfoSchema, 
  workExperienceSchema, 
  educationSchema,
  profileSchema,
  questionTemplateSchema,
  userAnswerSchema,
  QuestionTemplate,
  UserAnswer,
  QuestionTemplateData,
  UserAnswerData
} from '@shared/schema';
import session from 'express-session';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: number;
        uid: string;
        email: string;
        firebaseUser: DecodedIdToken;
      };
    }
  }
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Auth middleware
const authMiddleware = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      firebaseUser: decodedToken
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to get user ID from Firebase UID
const getUserId = async (req: Request): Promise<number | null> => {
  if (req.user?.uid) {
    let dbUser = await storage.getUserByFirebaseUID(req.user.uid);
    
    if (!dbUser) {
      console.log(`Auto-creating new user for Firebase UID: ${req.user.uid}`);
      dbUser = await storage.createUser({
        email: req.user.email,
        username: req.user.email,
        displayName: req.user.firebaseUser.name || req.user.email.split('@')[0],
        password: null,
        firebaseUID: req.user.uid,
        photoURL: req.user.firebaseUser.picture || null,
        authProvider: 'firebase'
      });
      
      await storage.createProfile(dbUser.id);
      console.log(`Created user ID ${dbUser.id} and profile for Firebase user ${req.user.uid}`);
    }
    
    return dbUser?.id || null;
  }
  return null;
};

// API Routes

// User routes
app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    if (req.user?.uid) {
      let dbUser = await storage.getUserByFirebaseUID(req.user.uid);
      
      if (!dbUser) {
        console.log(`Creating new user for Firebase UID: ${req.user.uid}`);
        dbUser = await storage.createUser({
          email: req.user.email,
          username: req.user.email,
          displayName: req.user.firebaseUser.name || req.user.email.split('@')[0],
          password: null,
          firebaseUID: req.user.uid,
          photoURL: req.user.firebaseUser.picture || null,
          authProvider: 'firebase'
        });
      }
      
      res.json(dbUser);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile routes
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profileData = profileSchema.parse(req.body);
    const updatedProfile = await storage.updateProfile(userId, profileData);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Resume routes
app.post('/api/resume/process', authMiddleware, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { file, fileType } = req.body;
    if (!file || !fileType) {
      return res.status(400).json({ message: "No file or file type provided" });
    }

    const parsedData = await processResumeFile(file, fileType);

    // Save resume data
    const resume = await storage.addResume(userId, {
      content: file,
      parsedData: JSON.stringify(parsedData)
    });

    res.json(resume);
  } catch (error) {
    console.error('Process resume error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Question template routes
app.get('/api/questions', authMiddleware, async (req, res) => {
  try {
    const templates = await storage.getQuestionTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// User answer routes
app.post('/api/answers', authMiddleware, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const answerData = userAnswerSchema.parse(req.body);
    const answer = await storage.saveUserAnswer(userId, answerData);
    res.json(answer);
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Development server
if (process.env.NODE_ENV === "development") {
  createViteServer(app).catch((err) => {
    console.error("Error starting Vite server:", err);
    process.exit(1);
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
