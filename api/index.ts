import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { auth } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { registerRoutes } from './routes';
import { db } from './db';
import { seedTemplates } from './seed-templates';
import { processResumeFile } from './resumeProcessor';
import { parseResumeWithAI } from './openai';
import { storage } from './storage';
import { createViteServer } from './vite';
import type { ViteDevServer } from 'vite';

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

// Auth middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Setup development mode
async function setupDevMode() {
  if (process.env.NODE_ENV === 'development') {
    const vite = await createViteServer();
    app.use(vite.middlewares);

    // Development mode SPA handling
    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, '');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });

    return vite;
  }
  return null;
}

// Initialize the application
async function init() {
  // Setup routes
  await registerRoutes(app);

  // Setup development mode if needed
  await setupDevMode();

  // Start server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Start the application
init().catch(console.error);

export { app };
