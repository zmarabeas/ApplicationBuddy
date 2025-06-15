import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
} from "@shared/schema";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { authMiddleware } from "./auth-middleware";
import { upload, processResumeFile } from './resumeProcessor';
import { registerExtensionRoutes } from './extension-routes';
import {
  standardLimiter,
  authLimiter,
  resumeProcessingLimiter,
  gdprLimiter,
  extensionApiLimiter
} from './rate-limiter';

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify<string, string, number, Buffer>(scrypt);

// Hash a password with a random salt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString("hex")}.${salt}`;
}

// Verify a password against a stored hash
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [hash, salt] = hashedPassword.split(".");
  const derivedKey = await scryptAsync(password, salt, 64);
  return hash === derivedKey.toString("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware - using combined Firebase and session auth
  const requireAuth = authMiddleware;
  
  // Helper function to get user ID from either Firebase UID or session
  const getUserId = async (req: Request): Promise<number | null> => {
    // If we have Firebase auth
    if (req.user?.uid) {
      // Try to find user in database by Firebase UID
      let dbUser = await storage.getUserByFirebaseUID(req.user.uid);
      
      // If user doesn't exist in our database, create them
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
        
        // Create profile for new user
        await storage.createProfile(dbUser.id);
        console.log(`Created user ID ${dbUser.id} and profile for Firebase user ${req.user.uid}`);
      }
      
      return dbUser?.id || null;
    } 
    // Session-based auth
    return req.session?.user?.id || null;
  };

  // Apply standard rate limiting to all routes
  app.use(standardLimiter);

  // User routes
  app.get('/api/user', authMiddleware, async (req, res) => {
    try {
      // If we have Firebase user data
      if (req.user?.uid) {
        // Try to find user in database by Firebase UID
        let dbUser = await storage.getUserByFirebaseUID(req.user.uid);
        
        // If user doesn't exist in our database, create them
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
          
          // Create profile for new user
          await storage.createProfile(dbUser.id);
        }
        
        return res.json({
          id: dbUser.id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          photoURL: dbUser.photoURL
        });
      }
      
      // Fall back to session auth (legacy)
      const sessionUser = req.session?.user;
      if (sessionUser) {
        return res.json(sessionUser);
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { email, password, username, displayName, firebaseUID } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password if provided (for local auth)
      let hashedPassword = null;
      if (password && !firebaseUID) {
        hashedPassword = await hashPassword(password);
      }
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        displayName: displayName || username || email.split('@')[0],
        firebaseUID: firebaseUID || null,
        photoURL: null,
        authProvider: firebaseUID ? 'firebase' : 'local'
      });
      
      // Create profile for user
      const profile = await storage.createProfile(user.id);
      
      // Set session if using local auth
      if (!firebaseUID) {
        // Type declaration for session user only includes id and email
        req.session!.user = { id: user.id, email: user.email };
      }
      
      res.status(201).json({ 
        user: { id: user.id, email: user.email, displayName: user.displayName },
        profile: { id: profile.id }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Set session
      req.session!.user = { id: user.id, email: user.email };
      
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  app.post('/api/auth/firebase-login', authLimiter, async (req, res) => {
    try {
      const { firebaseUID, email, displayName, photoURL } = req.body;
      
      // Find user by Firebase UID
      let user = await storage.getUserByFirebaseUID(firebaseUID);
      
      // If user doesn't exist, create a new one
      if (!user) {
        user = await storage.createUser({
          email,
          username: email,
          password: null,
          displayName: displayName || null,
          photoURL: photoURL || null,
          firebaseUID,
          authProvider: 'firebase'
        });
        
        // Create profile for new user
        await storage.createProfile(user.id);
      } else {
        // Update existing user's info if needed
        await storage.updateUser(user.id, { 
          displayName: displayName || user.displayName,
          photoURL: photoURL || user.photoURL,
          lastLogin: new Date()
        });
      }
      
      // Get profile
      const profile = await storage.getProfile(user.id);
      
      res.json({ 
        user: { id: user.id, email: user.email, displayName: user.displayName },
        profile: profile ? { id: profile.id, completionPercentage: profile.completionPercentage } : null
      });
    } catch (error) {
      console.error('Firebase login error:', error);
      res.status(500).json({ message: "Server error during Firebase login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Profile routes
  app.get('/api/profile', requireAuth, async (req, res) => {
    try {
      // Get user ID using helper (which automatically creates user if needed)
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      console.log(`Getting profile for user ID: ${userId}`);
      
      // Get or create profile
      let profile = await storage.getProfile(userId);
      if (!profile) {
        console.log(`No profile found, creating one for user ID: ${userId}`);
        profile = await storage.createProfile(userId);
      }
      
      // Get work experiences and education
      const workExperiences = await storage.getWorkExperiences(profile.id);
      const educations = await storage.getEducations(profile.id);
      
      res.json({
        profile,
        workExperiences,
        educations
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: "Server error retrieving profile" });
    }
  });

  app.patch('/api/profile/personal-info', requireAuth, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const personalInfo = req.body;
      
      // Validate with zod
      const validationResult = personalInfoSchema.safeParse(personalInfo);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid personal information", errors: validationResult.error.format() });
      }
      
      // Get profile, create if not exists
      let profile = await storage.getProfile(userId);
      if (!profile) {
        profile = await storage.createProfile(userId);
      }
      
      // Update personal info
      profile = await storage.updatePersonalInfo(profile.id, personalInfo);
      
      res.json({ profile });
    } catch (error) {
      console.error('Update personal info error:', error);
      res.status(500).json({ message: "Server error updating personal information" });
    }
  });

  app.get('/api/profile/work-experiences', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      console.log('Getting profile for user ID:', userId);
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log('Getting work experiences for profile ID:', profile.id);
      const workExperiences = await storage.getWorkExperiences(profile.id);
      res.json({ workExperiences });
    } catch (error) {
      console.error('Get work experiences error:', error);
      res.status(500).json({ message: "Server error retrieving work experiences" });
    }
  });

  app.post('/api/profile/work-experiences', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      const workExp = req.body;
      
      // Validate with zod
      const validationResult = workExperienceSchema.safeParse(workExp);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid work experience data", errors: validationResult.error.format() });
      }
      
      console.log('Getting profile for user ID:', userId);
      // Get profile
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log('Adding work experience to profile ID:', profile.id);
      // Add work experience
      const newWorkExp = await storage.addWorkExperience(profile.id, workExp);
      
      res.status(201).json({ workExperience: newWorkExp });
    } catch (error) {
      console.error('Add work experience error:', error);
      res.status(500).json({ message: "Server error adding work experience" });
    }
  });

  app.patch('/api/profile/work-experiences/:id', requireAuth, async (req, res) => {
    try {
      const workExpId = parseInt(req.params.id);
      const workExp = req.body;
      
      // Update work experience
      const updatedWorkExp = await storage.updateWorkExperience(workExpId, workExp);
      
      res.json({ workExperience: updatedWorkExp });
    } catch (error) {
      console.error('Update work experience error:', error);
      res.status(500).json({ message: "Server error updating work experience" });
    }
  });

  app.delete('/api/profile/work-experiences/:id', requireAuth, async (req, res) => {
    try {
      const workExpId = parseInt(req.params.id);
      
      // Delete work experience
      const result = await storage.deleteWorkExperience(workExpId);
      
      if (result) {
        res.json({ message: "Work experience deleted successfully" });
      } else {
        res.status(404).json({ message: "Work experience not found" });
      }
    } catch (error) {
      console.error('Delete work experience error:', error);
      res.status(500).json({ message: "Server error deleting work experience" });
    }
  });

  app.get('/api/profile/educations', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      console.log('Getting profile for user ID:', userId);
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log('Getting educations for profile ID:', profile.id);
      const educations = await storage.getEducations(profile.id);
      res.json({ educations });
    } catch (error) {
      console.error('Get educations error:', error);
      res.status(500).json({ message: "Server error retrieving educations" });
    }
  });

  app.post('/api/profile/educations', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      const education = req.body;
      
      // Validate with zod
      const validationResult = educationSchema.safeParse(education);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid education data", errors: validationResult.error.format() });
      }
      
      console.log('Getting profile for user ID:', userId);
      // Get profile
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log('Adding education to profile ID:', profile.id);
      // Add education
      const newEducation = await storage.addEducation(profile.id, education);
      
      res.status(201).json({ education: newEducation });
    } catch (error) {
      console.error('Add education error:', error);
      res.status(500).json({ message: "Server error adding education" });
    }
  });

  app.patch('/api/profile/educations/:id', requireAuth, async (req, res) => {
    try {
      const educationId = parseInt(req.params.id);
      const education = req.body;
      
      // Update education
      const updatedEducation = await storage.updateEducation(educationId, education);
      
      res.json({ education: updatedEducation });
    } catch (error) {
      console.error('Update education error:', error);
      res.status(500).json({ message: "Server error updating education" });
    }
  });

  app.delete('/api/profile/educations/:id', requireAuth, async (req, res) => {
    try {
      const educationId = parseInt(req.params.id);
      
      // Delete education
      const result = await storage.deleteEducation(educationId);
      
      if (result) {
        res.json({ message: "Education deleted successfully" });
      } else {
        res.status(404).json({ message: "Education not found" });
      }
    } catch (error) {
      console.error('Delete education error:', error);
      res.status(500).json({ message: "Server error deleting education" });
    }
  });

  app.get('/api/profile/skills', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      console.log('Getting profile for user ID:', userId);
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log('Getting skills for profile ID:', profile.id);
      res.json({ skills: profile.skills || [] });
    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({ message: "Server error retrieving skills" });
    }
  });

  app.patch('/api/profile/skills', requireAuth, async (req, res) => {
    try {
      // Get user ID from Firebase auth
      const firebaseUID = req.user?.uid;
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user from Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = user.id;
      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array" });
      }
      
      console.log('Getting profile for user ID:', userId);
      // Get profile
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Remove duplicates from skills array
      const uniqueSkills = Array.from(new Set(skills));
      if (uniqueSkills.length !== skills.length) {
        console.log('Removed', skills.length - uniqueSkills.length, 'duplicate skills');
      }
      
      console.log('Updating skills for profile ID:', profile.id);
      // Update skills with deduplicated array
      const updatedProfile = await storage.updateSkills(profile.id, uniqueSkills);
      
      res.json({ profile: updatedProfile });
    } catch (error) {
      console.error('Update skills error:', error);
      res.status(500).json({ message: "Server error updating skills" });
    }
  });

  // Resume routes
  app.get('/api/resumes', requireAuth, async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // First get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const resumes = await storage.getResumes(user.id);
      res.json({ resumes });
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ message: "Server error retrieving resumes" });
    }
  });
  
  // Use upload middleware and resume processor for file handling
  
  // Upload and parse resume route (Transaction-based to prevent duplication)
  app.post('/api/resumes/upload', requireAuth, resumeProcessingLimiter, upload.single('resume'), async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // First get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get file path and type
      const filePath = req.file.path;
      const fileType = req.file.originalname.split('.').pop()?.toLowerCase();
      
      if (fileType !== 'pdf' && fileType !== 'docx') {
        return res.status(400).json({ message: "Unsupported file type. Only PDF and DOCX are allowed." });
      }
      
      console.log(`Processing resume file: ${req.file.originalname} (${fileType})`);
      
      // Process the resume file
      const parsedData = await processResumeFile(filePath, fileType);
      
      console.log(`Resume processed successfully, using transaction-based update to prevent duplication`);
      
      // Use the new transaction-based method to process all resume data
      // This prevents duplication by handling all updates in a single atomic transaction
      const result = await storage.processResumeDataInTransaction(user.id, {
        filename: req.file.originalname,
        fileType,
        parsedData
      });
      
      console.log(`Resume data transaction completed successfully. Resume ID: ${result.resumeId}`);
      
      // Get the created resume
      const resume = await storage.getResumes(user.id)
        .then(resumes => resumes.find(r => r.id === result.resumeId));
      
      // Return data
      res.status(201).json({
        resume,
        parsedData
      });
    } catch (error) {
      console.error('Resume upload and parsing error:', error);
      res.status(500).json({ 
        message: "Error processing resume",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // GET /api/resumes - Get all user's resumes
  app.get('/api/resumes', requireAuth, async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // First get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all resumes for this user
      const resumes = await storage.getResumes(user.id);
      
      // Return resumes
      res.json({ resumes });
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ message: "Server error retrieving resumes" });
    }
  });
  
  // POST /api/resumes - Upload a resume (metadata only)
  app.post('/api/resumes', requireAuth, async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // First get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { filename, fileType } = req.body;
      
      // Add resume record without processing (metadata only)
      const resume = await storage.addResume(user.id, { filename, fileType });
      
      // Return only the resume record - This endpoint doesn't process or duplicate data
      res.status(201).json({ resume });
    } catch (error) {
      console.error('Upload resume error:', error);
      res.status(500).json({ message: "Server error uploading resume" });
    }
  });

  app.delete('/api/resumes/:id', requireAuth, async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      // Delete resume
      const result = await storage.deleteResume(resumeId);
      
      if (result) {
        res.json({ message: "Resume deleted successfully" });
      } else {
        res.status(404).json({ message: "Resume not found" });
      }
    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({ message: "Server error deleting resume" });
    }
  });

  // Extension API routes
  app.get('/api/extension/profile', requireAuth, async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // First get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get work experiences and education
      const workExperiences = await storage.getWorkExperiences(profile.id);
      const educations = await storage.getEducations(profile.id);
      
      // Format data for extension
      const formattedProfile = {
        personalInfo: profile.personalInfo,
        workExperiences,
        educations,
        skills: profile.skills
      };
      
      res.json(formattedProfile);
    } catch (error) {
      console.error('Get extension profile error:', error);
      res.status(500).json({ message: "Server error retrieving profile for extension" });
    }
  });
  
  // Profile reset endpoint
  app.post('/api/profile/reset', requireAuth, async (req, res) => {
    try {
      // Get Firebase UID from request
      const firebaseUID = req.user?.uid || '';
      if (!firebaseUID) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get the user by Firebase UID
      const user = await storage.getUserByFirebaseUID(firebaseUID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset the user's profile
      console.log(`Attempting to reset profile for user ID: ${user.id}`);
      const success = await storage.resetUserProfile(user.id);
      
      if (success) {
        console.log(`Successfully reset profile for user ID: ${user.id}`);
        return res.status(200).json({ message: "Profile reset successfully" });
      } else {
        console.error(`Failed to reset profile for user ID: ${user.id}`);
        return res.status(500).json({ message: "Failed to reset profile" });
      }
    } catch (error) {
      console.error('Profile reset error:', error);
      res.status(500).json({ message: "Server error resetting profile" });
    }
  });

    // GDPR/CCPA Compliance Routes
  // Data Export
  app.get('/api/user/export-data', requireAuth, gdprLimiter, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user's basic info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get profile
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Get work experiences
      const workExperiences = profile ? await storage.getWorkExperiences(profile.id) : [];
      
      // Get educations
      const educations = profile ? await storage.getEducations(profile.id) : [];
      
      // Get resumes
      const resumes = await storage.getResumes(userId);

      // Compile all data for export
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        profile: profile,
        workExperiences: workExperiences,
        educations: educations,
        resumes: resumes,
      };

      // Log the export for audit
      console.log(`User ${userId} exported their data at ${new Date().toISOString()}`);
      
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ message: "Server error while exporting data" });
    }
  });

  // Account Deletion
  app.post('/api/user/delete-account', requireAuth, gdprLimiter, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Reset profile first (this will delete all related data)
      await storage.resetUserProfile(userId);
      
      // Then delete user account itself (implementing a soft delete mechanism here)
      // In a real implementation, you would delete the user or anonymize their data
      await storage.updateUser(userId, {
        email: `deleted_${userId}@deleted.invalid`,
        username: `deleted_${userId}`,
        displayName: "Deleted User",
        // Note: isDeleted field might need to be added to the user schema
        // isDeleted: true,
        // deletedAt: new Date(),
      });

      // If using Firebase, you could also delete the Firebase user
      if (user.firebaseUID) {
        // This would require additional Firebase Admin SDK permission
        console.log(`Account deletion should also handle Firebase user ${user.firebaseUID}`);
        // In a real implementation: await admin.auth().deleteUser(user.firebaseUID);
      }

      // Log the deletion for audit
      console.log(`User ${userId} deleted their account at ${new Date().toISOString()}`);
      
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: "Server error while deleting account" });
    }
  });
  
  // Question Template Routes
  // Get all templates
  app.get('/api/templates', standardLimiter, async (req, res) => {
    try {
      const templates = await storage.getQuestionTemplates();
      res.json({ templates });
    } catch (error) {
      console.error('Error retrieving question templates:', error);
      res.status(500).json({ message: "Server error retrieving templates" });
    }
  });

  // Get templates by category
  app.get('/api/templates/category/:category', standardLimiter, async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await storage.getQuestionTemplatesByCategory(category);
      res.json({ templates });
    } catch (error) {
      console.error(`Error retrieving templates for category ${req.params.category}:`, error);
      res.status(500).json({ message: "Server error retrieving templates" });
    }
  });

  // Get single template
  app.get('/api/templates/:id', standardLimiter, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getQuestionTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json({ template });
    } catch (error) {
      console.error(`Error retrieving template ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error retrieving template" });
    }
  });

  // Create template (admin only)
  app.post('/api/templates', requireAuth, async (req, res) => {
    try {
      // Check if user is admin (implement proper admin check in production)
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // In a real app, you would check if the user is an admin here
      // For now, we'll just allow all authenticated users for development
      
      const templateData = req.body;
      if (!templateData.category || !templateData.question || !templateData.questionType) {
        return res.status(400).json({ message: "Missing required template fields" });
      }
      
      const newTemplate = await storage.createQuestionTemplate(templateData);
      res.status(201).json({ template: newTemplate });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ message: "Server error creating template" });
    }
  });

  // Update template (admin only)
  app.put('/api/templates/:id', requireAuth, async (req, res) => {
    try {
      // Check if user is admin (implement proper admin check in production)
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const templateData = req.body;
      const updatedTemplate = await storage.updateQuestionTemplate(templateId, templateData);
      res.json({ template: updatedTemplate });
    } catch (error) {
      console.error(`Error updating template ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating template" });
    }
  });

  // Delete template (admin only)
  app.delete('/api/templates/:id', requireAuth, async (req, res) => {
    try {
      // Check if user is admin (implement proper admin check in production)
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const result = await storage.deleteQuestionTemplate(templateId);
      if (result) {
        res.json({ message: "Template deleted successfully" });
      } else {
        res.status(404).json({ message: "Template not found" });
      }
    } catch (error) {
      console.error(`Error deleting template ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting template" });
    }
  });

  // User Answer Routes
  // Get all answers for the current user
  app.get('/api/answers', requireAuth, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const answers = await storage.getUserAnswers(userId);
      res.json({ answers });
    } catch (error) {
      console.error('Error retrieving user answers:', error);
      res.status(500).json({ message: "Server error retrieving answers" });
    }
  });

  // Get specific answer for a template
  app.get('/api/answers/template/:templateId', requireAuth, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const templateId = parseInt(req.params.templateId);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const answer = await storage.getUserAnswer(userId, templateId);
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      res.json({ answer });
    } catch (error) {
      console.error(`Error retrieving answer for template ${req.params.templateId}:`, error);
      res.status(500).json({ message: "Server error retrieving answer" });
    }
  });

  // Save or update an answer
  app.post('/api/answers', requireAuth, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const answerData = req.body;
      if (!answerData.templateId || !answerData.answer) {
        return res.status(400).json({ message: "Missing required answer fields" });
      }
      
      const savedAnswer = await storage.saveUserAnswer(userId, answerData);
      res.status(201).json({ answer: savedAnswer });
    } catch (error) {
      console.error('Error saving answer:', error);
      res.status(500).json({ message: "Server error saving answer" });
    }
  });

  // Delete an answer
  app.delete('/api/answers/:id', requireAuth, async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const answerId = parseInt(req.params.id);
      if (isNaN(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
      }
      
      // Get the answer to check ownership
      const answer = await storage.getUserAnswer(userId, answerId);
      if (!answer) {
        return res.status(404).json({ message: "Answer not found or you don't have permission to delete it" });
      }
      
      const result = await storage.deleteUserAnswer(answerId);
      if (result) {
        res.json({ message: "Answer deleted successfully" });
      } else {
        res.status(404).json({ message: "Answer not found" });
      }
    } catch (error) {
      console.error(`Error deleting answer ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting answer" });
    }
  });
  
  // Register extension-specific routes
  registerExtensionRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
