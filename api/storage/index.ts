import { 
  User, InsertUser, Profile, WorkExperience, Education, Resume,
  QuestionTemplate, UserAnswer, QuestionTemplateData, UserAnswerData,
  users, profiles, workExperiences, educations, resumes,
  questionTemplates, userAnswers
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
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
    console.log("Firebase Admin initialized successfully in storage");
  } catch (error) {
    console.error("Firebase Admin initialization error in storage:", error);
  }
}

// Get Firestore instance
const firestore = admin.firestore();

// Define Firestore collections
const USERS_COLLECTION = 'users';
const PROFILES_COLLECTION = 'profiles';
const WORK_EXPERIENCES_COLLECTION = 'workExperiences';
const EDUCATIONS_COLLECTION = 'educations';
const RESUMES_COLLECTION = 'resumes';
const QUESTION_TEMPLATES_COLLECTION = 'questionTemplates';
const USER_ANSWERS_COLLECTION = 'userAnswers';

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Profile operations
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(userId: number): Promise<Profile>;
  updateProfile(profileId: number, data: Partial<Profile>): Promise<Profile>;
  updatePersonalInfo(profileId: number, personalInfo: any): Promise<Profile>;
  updateSkills(profileId: number, skills: string[]): Promise<Profile>;
  updateProfileCompletionPercentage(profileId: number): Promise<number>;
  resetUserProfile(userId: number): Promise<boolean>;
  
  // Work Experience operations
  getWorkExperiences(profileId: number): Promise<WorkExperience[]>;
  addWorkExperience(profileId: number, workExp: any): Promise<WorkExperience>;
  updateWorkExperience(id: number, workExp: any): Promise<WorkExperience>;
  deleteWorkExperience(id: number): Promise<boolean>;
  
  // Education operations
  getEducations(profileId: number): Promise<Education[]>;
  addEducation(profileId: number, education: any): Promise<Education>;
  updateEducation(id: number, education: any): Promise<Education>;
  deleteEducation(id: number): Promise<boolean>;
  
  // Resume operations
  getResumes(userId: number): Promise<Resume[]>;
  addResume(userId: number, resume: any): Promise<Resume>;
  deleteResume(id: number): Promise<boolean>;
  
  // Question Template operations
  getQuestionTemplates(): Promise<QuestionTemplate[]>;
  getQuestionTemplatesByCategory(category: string): Promise<QuestionTemplate[]>;
  getQuestionTemplate(id: number): Promise<QuestionTemplate | undefined>;
  createQuestionTemplate(template: QuestionTemplateData): Promise<QuestionTemplate>;
  updateQuestionTemplate(id: number, template: Partial<QuestionTemplateData>): Promise<QuestionTemplate>;
  deleteQuestionTemplate(id: number): Promise<boolean>;
  
  // User Answer operations
  getUserAnswers(userId: number): Promise<UserAnswer[]>;
  getUserAnswer(userId: number, templateId: number): Promise<UserAnswer | undefined>;
  saveUserAnswer(userId: number, answer: UserAnswerData): Promise<UserAnswer>;
  updateUserAnswer(id: number, answer: Partial<UserAnswerData>): Promise<UserAnswer>;
  deleteUserAnswer(id: number): Promise<boolean>;
}

// Export a single storage instance that uses Firestore
export const storage: IStorage = {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUID, firebaseUID));
    return user;
  },

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  },

  // Profile operations
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  },

  async createProfile(userId: number): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId,
        personalInfo: {},
        skills: [],
        completionPercentage: 0
      })
      .returning();
    return profile;
  },

  async updateProfile(profileId: number, data: Partial<Profile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, profileId))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    return updatedProfile;
  },

  async updatePersonalInfo(profileId: number, personalInfo: any): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ personalInfo })
      .where(eq(profiles.id, profileId))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    return updatedProfile;
  },

  async updateSkills(profileId: number, skills: string[]): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ skills })
      .where(eq(profiles.id, profileId))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    return updatedProfile;
  },

  async updateProfileCompletionPercentage(profileId: number): Promise<number> {
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }

    let completionPercentage = 0;
    const totalFields = 5; // Adjust based on your profile fields

    // Check personal info
    if (profile.personalInfo && Object.keys(profile.personalInfo).length > 0) {
      completionPercentage += 20;
    }

    // Check skills
    if (profile.skills && profile.skills.length > 0) {
      completionPercentage += 20;
    }

    // Check work experiences
    const workExperiences = await this.getWorkExperiences(profileId);
    if (workExperiences.length > 0) {
      completionPercentage += 20;
    }

    // Check education
    const educations = await this.getEducations(profileId);
    if (educations.length > 0) {
      completionPercentage += 20;
    }

    // Check resumes
    const resumes = await this.getResumes(profile.userId);
    if (resumes.length > 0) {
      completionPercentage += 20;
    }

    // Update the profile with the new completion percentage
    await this.updateProfile(profileId, { completionPercentage });

    return completionPercentage;
  },

  async resetUserProfile(userId: number): Promise<boolean> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return false;
    }

    // Delete all related data
    await db.delete(workExperiences).where(eq(workExperiences.profileId, profile.id));
    await db.delete(educations).where(eq(educations.profileId, profile.id));
    await db.delete(resumes).where(eq(resumes.userId, userId));
    await db.delete(userAnswers).where(eq(userAnswers.userId, userId));

    // Reset profile
    await this.updateProfile(profile.id, {
      personalInfo: {},
      skills: [],
      completionPercentage: 0
    });

    return true;
  },

  // Work Experience operations
  async getWorkExperiences(profileId: number): Promise<WorkExperience[]> {
    return db.select().from(workExperiences).where(eq(workExperiences.profileId, profileId));
  },

  async addWorkExperience(profileId: number, workExp: any): Promise<WorkExperience> {
    const [newWorkExp] = await db
      .insert(workExperiences)
      .values({
        profileId,
        company: workExp.company,
        title: workExp.title,
        location: workExp.location,
        startDate: workExp.startDate,
        endDate: workExp.endDate,
        current: workExp.current,
        description: workExp.description
      })
      .returning();
    return newWorkExp;
  },

  async updateWorkExperience(id: number, workExp: any): Promise<WorkExperience> {
    const [updatedWorkExp] = await db
      .update(workExperiences)
      .set(workExp)
      .where(eq(workExperiences.id, id))
      .returning();
    
    if (!updatedWorkExp) {
      throw new Error(`Work experience with ID ${id} not found`);
    }
    
    return updatedWorkExp;
  },

  async deleteWorkExperience(id: number): Promise<boolean> {
    const [workExp] = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.id, id));
      
    if (!workExp) {
      return false;
    }
    
    await db.delete(workExperiences).where(eq(workExperiences.id, id));
    return true;
  },

  // Education operations
  async getEducations(profileId: number): Promise<Education[]> {
    return db.select().from(educations).where(eq(educations.profileId, profileId));
  },

  async addEducation(profileId: number, education: any): Promise<Education> {
    const [newEducation] = await db
      .insert(educations)
      .values({
        profileId,
        institution: education.institution,
        degree: education.degree,
        field: education.field,
        startDate: education.startDate,
        endDate: education.endDate,
        current: education.current,
        description: education.description
      })
      .returning();
    return newEducation;
  },

  async updateEducation(id: number, education: any): Promise<Education> {
    const [updatedEducation] = await db
      .update(educations)
      .set(education)
      .where(eq(educations.id, id))
      .returning();
    
    if (!updatedEducation) {
      throw new Error(`Education with ID ${id} not found`);
    }
    
    return updatedEducation;
  },

  async deleteEducation(id: number): Promise<boolean> {
    const [education] = await db
      .select()
      .from(educations)
      .where(eq(educations.id, id));
      
    if (!education) {
      return false;
    }
    
    await db.delete(educations).where(eq(educations.id, id));
    return true;
  },

  // Resume operations
  async getResumes(userId: number): Promise<Resume[]> {
    return db.select().from(resumes).where(eq(resumes.userId, userId));
  },

  async addResume(userId: number, resume: any): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId,
        filename: resume.filename,
        fileType: resume.fileType,
        uploadedAt: new Date()
      })
      .returning();
    return newResume;
  },

  async deleteResume(id: number): Promise<boolean> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));
      
    if (!resume) {
      return false;
    }
    
    await db.delete(resumes).where(eq(resumes.id, id));
    return true;
  },

  // Question Template operations
  async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    return db.select().from(questionTemplates);
  },

  async getQuestionTemplatesByCategory(category: string): Promise<QuestionTemplate[]> {
    return db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.category, category));
  },

  async getQuestionTemplate(id: number): Promise<QuestionTemplate | undefined> {
    const [template] = await db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.id, id));
    return template;
  },

  async createQuestionTemplate(template: QuestionTemplateData): Promise<QuestionTemplate> {
    const [newTemplate] = await db
      .insert(questionTemplates)
      .values({
        category: template.category,
        question: template.question,
        questionType: template.questionType,
        options: template.options || null,
        description: template.description || null,
        commonFields: template.commonFields || null
      })
      .returning();
    return newTemplate;
  },

  async updateQuestionTemplate(id: number, template: Partial<QuestionTemplateData>): Promise<QuestionTemplate> {
    const [updatedTemplate] = await db
      .update(questionTemplates)
      .set(template)
      .where(eq(questionTemplates.id, id))
      .returning();
    
    if (!updatedTemplate) {
      throw new Error(`Question template with ID ${id} not found`);
    }
    
    return updatedTemplate;
  },

  async deleteQuestionTemplate(id: number): Promise<boolean> {
    const [template] = await db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.id, id));
      
    if (!template) {
      return false;
    }
    
    await db.delete(questionTemplates).where(eq(questionTemplates.id, id));
    return true;
  },

  // User Answer operations
  async getUserAnswers(userId: number): Promise<UserAnswer[]> {
    return db.select().from(userAnswers).where(eq(userAnswers.userId, userId));
  },

  async getUserAnswer(userId: number, templateId: number): Promise<UserAnswer | undefined> {
    const [answer] = await db
      .select()
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.userId, userId),
          eq(userAnswers.templateId, templateId)
        )
      );
    return answer;
  },

  async saveUserAnswer(userId: number, answer: UserAnswerData): Promise<UserAnswer> {
    // Check if this user already has an answer for this template
    const existingAnswer = await this.getUserAnswer(userId, answer.templateId);
    
    if (existingAnswer) {
      // Update existing answer
      return this.updateUserAnswer(existingAnswer.id, { answer: answer.answer });
    } else {
      // Create new answer
      const [newAnswer] = await db
        .insert(userAnswers)
        .values({
          userId,
          templateId: answer.templateId,
          answer: answer.answer
        })
        .returning();
      return newAnswer;
    }
  },

  async updateUserAnswer(id: number, answer: Partial<UserAnswerData>): Promise<UserAnswer> {
    const [updatedAnswer] = await db
      .update(userAnswers)
      .set(answer)
      .where(eq(userAnswers.id, id))
      .returning();
    
    if (!updatedAnswer) {
      throw new Error(`User answer with ID ${id} not found`);
    }
    
    return updatedAnswer;
  },

  async deleteUserAnswer(id: number): Promise<boolean> {
    const [answer] = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.id, id));
      
    if (!answer) {
      return false;
    }
    
    await db.delete(userAnswers).where(eq(userAnswers.id, id));
    return true;
  }
}; 