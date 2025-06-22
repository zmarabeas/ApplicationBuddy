// ApplicationBuddy API - Serverless Function for Vercel
// Based on TextBlaster pattern but adapted for Firebase Admin

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firestoreStorage } from './firestore-storage.js';
import { upload, processResumeFile } from './resumeProcessor.js';
import { parseResumeWithAI } from './openai.js';
import { seedTemplates } from './seed-templates.js';
import { config } from './config.js';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { 
  personalInfoSchema, 
  workExperienceSchema, 
  educationSchema,
  profileSchema,
  questionTemplateSchema,
  userAnswerSchema
} from './schema.js';

// Auth middleware for serverless
const authMiddleware = async (req: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      firebaseUser: decodedToken
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Invalid token');
  }
};

// Helper function to get user ID from Firebase UID
const getUserId = async (user: any): Promise<number | null> => {
  if (user?.uid) {
    let dbUser = await firestoreStorage.getUserByFirebaseUID(user.uid);
    
    if (!dbUser) {
      console.log(`Auto-creating new user for Firebase UID: ${user.uid}`);
      dbUser = await firestoreStorage.createUser({
        email: user.email,
        username: user.email,
        displayName: user.firebaseUser.name || user.email.split('@')[0],
        password: null,
        firebaseUID: user.uid,
        photoURL: user.firebaseUser.picture || null,
        authProvider: 'firebase'
      });
      
      await firestoreStorage.createProfile(Number(dbUser.id));
      console.log(`Created user ID ${dbUser.id} and profile for Firebase user ${user.uid}`);
    }
    
    return dbUser?.id || null;
  }
  return null;
};

// Route handlers
async function handleUser(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    let dbUser = await firestoreStorage.getUserByFirebaseUID(user.uid);
    
    if (!dbUser) {
      console.log(`Creating new user for Firebase UID: ${user.uid}`);
      dbUser = await firestoreStorage.createUser({
        email: user.email,
        username: user.email,
        displayName: user.firebaseUser.name || user.email.split('@')[0],
        password: null,
        firebaseUID: user.uid,
        photoURL: user.firebaseUser.picture || null,
        authProvider: 'firebase'
      });
    }
    
    res.json(dbUser);
  } catch (error) {
    console.error('Error in /user:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
}

async function handleProfile(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log('Profile data being sent to frontend:', JSON.stringify(profile, null, 2));
    console.log('Profile completionPercentage:', profile.completionPercentage);
    console.log('Profile type:', typeof profile.completionPercentage);

    res.json(profile);
  } catch (error) {
    console.error('Error in /profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateProfile(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const updatedProfile = await firestoreStorage.updateProfile(profile.id, req.body);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error in /profile update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Work Experience handlers
async function handleAddWorkExperience(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const workExp = workExperienceSchema.parse(req.body);
    const updatedWorkExp = await firestoreStorage.addWorkExperience(profile.id, workExp);
    res.json(updatedWorkExp);
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetWorkExperiences(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const workExperiences = await firestoreStorage.getWorkExperiences(profile.id);
    res.json(workExperiences);
  } catch (error) {
    console.error('Error getting work experiences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateWorkExperience(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const workExp = workExperienceSchema.parse(req.body);
    const updatedWorkExp = await firestoreStorage.updateWorkExperience(parseInt(req.params.id), workExp);
    res.json(updatedWorkExp);
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteWorkExperience(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const success = await firestoreStorage.deleteWorkExperience(parseInt(req.params.id));
    res.json({ success });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Education handlers
async function handleAddEducation(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const education = educationSchema.parse(req.body);
    const updatedEducation = await firestoreStorage.addEducation(profile.id, education);
    res.json(updatedEducation);
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetEducations(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const educations = await firestoreStorage.getEducations(profile.id);
    res.json(educations);
  } catch (error) {
    console.error('Error getting educations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateEducation(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const education = educationSchema.parse(req.body);
    const updatedEducation = await firestoreStorage.updateEducation(parseInt(req.params.id), education);
    res.json(updatedEducation);
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteEducation(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const success = await firestoreStorage.deleteEducation(parseInt(req.params.id));
    res.json({ success });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Skills handler
async function handleUpdateSkills(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    const updatedProfile = await firestoreStorage.updateSkills(profile.id, skills);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Resume handlers
async function handleResumeProcess(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Use multer to handle file upload
    upload.single('resume')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        // Get file type from the uploaded file
        const fileType = req.file.originalname.split('.').pop()?.toLowerCase();
        if (!fileType || !['pdf', 'docx'].includes(fileType)) {
          return res.status(400).json({ message: "Invalid file type. Only PDF and DOCX files are allowed." });
        }

        // Process the resume file
        const parsedData = await processResumeFile(req.file.path, fileType);
        
        // Save to Firestore
        const resume = await firestoreStorage.addResume(userId, {
          filename: req.file.originalname,
          fileType: fileType,
          parsedData: parsedData
        });

        res.json({
          success: true,
          resume: resume,
          parsedData: parsedData
        });
      } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ 
          message: error instanceof Error ? error.message : 'Failed to process resume' 
        });
      }
    });
  } catch (error) {
    console.error('Error in resume process handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetResumes(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const resumes = await firestoreStorage.getResumes(userId);
    res.json(resumes);
  } catch (error) {
    console.error('Error getting resumes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteResume(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const success = await firestoreStorage.deleteResume(parseInt(req.params.id));
    res.json({ success });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Questions and Answers handlers
async function handleGetQuestions(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const templates = await firestoreStorage.getQuestionTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSaveAnswer(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const answer = userAnswerSchema.parse(req.body);
    const savedAnswer = await firestoreStorage.saveUserAnswer(userId, answer);
    res.json(savedAnswer);
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetAnswers(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const answers = await firestoreStorage.getUserAnswers(userId);
    res.json(answers);
  } catch (error) {
    console.error('Error getting answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Profile reset handler
async function handleResetProfile(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const success = await firestoreStorage.resetUserProfile(userId);
    res.json({ success });
  } catch (error) {
    console.error('Error resetting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// User data export handler
async function handleExportData(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const workExperiences = await firestoreStorage.getWorkExperiences(profile.id);
    const educations = await firestoreStorage.getEducations(profile.id);
    const resumes = await firestoreStorage.getResumes(userId);
    const answers = await firestoreStorage.getUserAnswers(userId);

    res.json({
      profile,
      workExperiences,
      educations,
      resumes,
      answers
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete account handler
async function handleDeleteAccount(req: any, res: any) {
  try {
    const user = await authMiddleware(req);
    const userId = await getUserId(user);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await firestoreStorage.getProfile(userId);
    if (profile) {
      await firestoreStorage.resetUserProfile(userId);
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTemplates(req: any, res: any) {
  try {
    const templates = await seedTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleHealth(req: any, res: any) {
  try {
    // Try to access Firestore to check if Firebase is initialized
    const db = getFirestore();
    res.json({ 
      status: 'healthy',
      message: 'ApplicationBuddy API with Firebase', 
      timestamp: new Date().toISOString(),
      firebase: 'initialized'
    });
  } catch (error) {
    res.json({ 
      status: 'healthy',
      message: 'ApplicationBuddy API with Firebase', 
      timestamp: new Date().toISOString(),
      firebase: 'not configured',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Main handler for Vercel
export default async (req: any, res: any) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url?.replace('/api', '') || '/';

  try {
    // Route handling
    if (path === '/health' && method === 'GET') {
      return await handleHealth(req, res);
    }

    if (path === '/user' && method === 'GET') {
      return await handleUser(req, res);
    }

    if (path === '/profile' && method === 'GET') {
      return await handleProfile(req, res);
    }

    if (path === '/profile' && method === 'PUT') {
      return await handleUpdateProfile(req, res);
    }

    if (path === '/profile/work-experiences' && method === 'POST') {
      return await handleAddWorkExperience(req, res);
    }

    if (path === '/profile/work-experiences' && method === 'GET') {
      return await handleGetWorkExperiences(req, res);
    }

    if (path.match(/^\/profile\/work-experiences\/\d+$/) && method === 'PATCH') {
      req.params = { id: path.split('/').pop() };
      return await handleUpdateWorkExperience(req, res);
    }

    if (path.match(/^\/profile\/work-experiences\/\d+$/) && method === 'DELETE') {
      req.params = { id: path.split('/').pop() };
      return await handleDeleteWorkExperience(req, res);
    }

    if (path === '/profile/educations' && method === 'POST') {
      return await handleAddEducation(req, res);
    }

    if (path === '/profile/educations' && method === 'GET') {
      return await handleGetEducations(req, res);
    }

    if (path.match(/^\/profile\/educations\/\d+$/) && method === 'PATCH') {
      req.params = { id: path.split('/').pop() };
      return await handleUpdateEducation(req, res);
    }

    if (path.match(/^\/profile\/educations\/\d+$/) && method === 'DELETE') {
      req.params = { id: path.split('/').pop() };
      return await handleDeleteEducation(req, res);
    }

    if (path === '/profile/skills' && method === 'PATCH') {
      return await handleUpdateSkills(req, res);
    }

    if (path === '/resume/process' && method === 'POST') {
      return await handleResumeProcess(req, res);
    }

    if (path === '/resumes' && method === 'GET') {
      return await handleGetResumes(req, res);
    }

    if (path.match(/^\/resumes\/\d+$/) && method === 'DELETE') {
      req.params = { id: path.split('/').pop() };
      return await handleDeleteResume(req, res);
    }

    if (path === '/questions' && method === 'GET') {
      return await handleGetQuestions(req, res);
    }

    if (path === '/answers' && method === 'POST') {
      return await handleSaveAnswer(req, res);
    }

    if (path === '/answers' && method === 'GET') {
      return await handleGetAnswers(req, res);
    }

    if (path === '/profile/reset' && method === 'POST') {
      return await handleResetProfile(req, res);
    }

    if (path === '/user/export-data' && method === 'GET') {
      return await handleExportData(req, res);
    }

    if (path === '/user/delete-account' && method === 'POST') {
      return await handleDeleteAccount(req, res);
    }

    if (path === '/templates' && method === 'GET') {
      return await handleTemplates(req, res);
    }

    // Default response for unmatched routes
    return res.status(404).json({ 
      message: 'Endpoint not found', 
      path, 
      method,
      availableEndpoints: [
        'GET /api/health',
        'GET /api/user',
        'GET /api/profile',
        'PUT /api/profile',
        'POST /api/profile/work-experiences',
        'GET /api/profile/work-experiences',
        'PATCH /api/profile/work-experiences/:id',
        'DELETE /api/profile/work-experiences/:id',
        'POST /api/profile/educations',
        'GET /api/profile/educations',
        'PATCH /api/profile/educations/:id',
        'DELETE /api/profile/educations/:id',
        'PATCH /api/profile/skills',
        'POST /api/resume/process',
        'GET /api/resumes',
        'DELETE /api/resumes/:id',
        'GET /api/questions',
        'POST /api/answers',
        'GET /api/answers',
        'POST /api/profile/reset',
        'GET /api/user/export-data',
        'POST /api/user/delete-account',
        'GET /api/templates'
      ]
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
