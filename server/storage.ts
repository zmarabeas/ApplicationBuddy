import { 
  User, InsertUser, Profile, WorkExperience, Education, Resume,
  QuestionTemplate, UserAnswer, QuestionTemplateData, UserAnswerData,
  users, profiles, workExperiences, educations, resumes,
  questionTemplates, userAnswers
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

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
  resetUserProfile(userId: number): Promise<boolean>; // New method to reset all user profile data
  
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

export class DatabaseStorage implements IStorage {
  // Question Template operations
  async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    const templates = await db
      .select()
      .from(questionTemplates);
    return templates;
  }

  async getQuestionTemplatesByCategory(category: string): Promise<QuestionTemplate[]> {
    const templates = await db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.category, category));
    return templates;
  }

  async getQuestionTemplate(id: number): Promise<QuestionTemplate | undefined> {
    const [template] = await db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.id, id));
    return template;
  }

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
  }

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
  }

  async deleteQuestionTemplate(id: number): Promise<boolean> {
    const [template] = await db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.id, id));
      
    if (!template) {
      return false;
    }
    
    await db
      .delete(questionTemplates)
      .where(eq(questionTemplates.id, id));
      
    return true;
  }

  // User Answer operations
  async getUserAnswers(userId: number): Promise<UserAnswer[]> {
    const answers = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId));
    return answers;
  }

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
  }

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
  }

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
  }

  async deleteUserAnswer(id: number): Promise<boolean> {
    const [answer] = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.id, id));
      
    if (!answer) {
      return false;
    }
    
    await db
      .delete(userAnswers)
      .where(eq(userAnswers.id, id));
      
    return true;
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUID, firebaseUID));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

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
  }

  // Profile operations
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
      
    return profile;
  }

  async createProfile(userId: number): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId,
        personalInfo: null,
        skills: null,
        completionPercentage: 0
      })
      .returning();
      
    return profile;
  }

  async updateProfile(profileId: number, data: Partial<Profile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, profileId))
      .returning();
      
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    await this.updateProfileCompletionPercentage(profileId);
    return updatedProfile;
  }

  async updatePersonalInfo(profileId: number, personalInfo: any): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ personalInfo })
      .where(eq(profiles.id, profileId))
      .returning();
      
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    await this.updateProfileCompletionPercentage(profileId);
    return updatedProfile;
  }

  async updateSkills(profileId: number, skills: string[]): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ skills })
      .where(eq(profiles.id, profileId))
      .returning();
      
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    await this.updateProfileCompletionPercentage(profileId);
    return updatedProfile;
  }

  async updateProfileCompletionPercentage(profileId: number): Promise<number> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId));
      
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    let completionPoints = 0;
    let totalPoints = 4; // Four sections: personal info, work exp, education, skills
    
    // Check personal info
    if (profile.personalInfo) {
      completionPoints += 1;
    }
    
    // Check work experiences
    const workExps = await this.getWorkExperiences(profileId);
    if (workExps.length > 0) {
      completionPoints += 1;
    }
    
    // Check education
    const educations = await this.getEducations(profileId);
    if (educations.length > 0) {
      completionPoints += 1;
    }
    
    // Check skills
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      completionPoints += 1;
    }
    
    const percentage = Math.round((completionPoints / totalPoints) * 100);
    
    const [updatedProfile] = await db
      .update(profiles)
      .set({ completionPercentage: percentage })
      .where(eq(profiles.id, profileId))
      .returning();
      
    return percentage;
  }
  
  async resetUserProfile(userId: number): Promise<boolean> {
    try {
      // Get the user profile
      const profile = await this.getProfile(userId);
      if (!profile) {
        return false;
      }
      
      // Step 1: Delete all work experiences
      const workExperienceList = await this.getWorkExperiences(profile.id);
      for (const workExp of workExperienceList) {
        await db.delete(workExperiences)
          .where(eq(workExperiences.id, workExp.id));
      }
      
      // Step 2: Delete all educations
      const educationEntries = await this.getEducations(profile.id);
      for (const education of educationEntries) {
        await db.delete(educations)
          .where(eq(educations.id, education.id));
      }
      
      // Step 3: Delete all resumes
      const resumeEntries = await this.getResumes(userId);
      for (const resume of resumeEntries) {
        await db.delete(resumes).where(eq(resumes.id, resume.id));
      }
      
      // Step 4: Reset profile data
      await db.update(profiles)
        .set({
          personalInfo: null,
          skills: null,
          completionPercentage: 0
        })
        .where(eq(profiles.id, profile.id));
      
      console.log(`User profile ${userId} successfully reset`);
      return true;
    } catch (error) {
      console.error('Error resetting user profile:', error);
      return false;
    }
  }

  // Work Experience operations
  async getWorkExperiences(profileId: number): Promise<WorkExperience[]> {
    const experiences = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.profileId, profileId))
      .orderBy(workExperiences.order);
      
    return experiences;
  }

  async addWorkExperience(profileId: number, workExp: any): Promise<WorkExperience> {
    // Get current experiences to calculate next order value
    const currentExps = await this.getWorkExperiences(profileId);
    const nextOrder = currentExps.length;
    
    const [experience] = await db
      .insert(workExperiences)
      .values({
        profileId,
        company: workExp.company,
        title: workExp.title,
        location: workExp.location || null,
        startDate: workExp.startDate || null,
        endDate: workExp.endDate || null,
        current: workExp.current || false,
        description: workExp.description || null,
        order: nextOrder
      })
      .returning();
      
    await this.updateProfileCompletionPercentage(profileId);
    return experience;
  }

  async updateWorkExperience(id: number, workExp: any): Promise<WorkExperience> {
    const [updatedExperience] = await db
      .update(workExperiences)
      .set(workExp)
      .where(eq(workExperiences.id, id))
      .returning();
      
    if (!updatedExperience) {
      throw new Error(`Work experience with ID ${id} not found`);
    }
    
    await this.updateProfileCompletionPercentage(updatedExperience.profileId);
    return updatedExperience;
  }

  async deleteWorkExperience(id: number): Promise<boolean> {
    const [experience] = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.id, id));
      
    if (!experience) {
      return false;
    }
    
    const profileId = experience.profileId;
    
    await db
      .delete(workExperiences)
      .where(eq(workExperiences.id, id));
      
    // Reorder remaining experiences
    const remainingExps = await this.getWorkExperiences(profileId);
    for (let i = 0; i < remainingExps.length; i++) {
      await db
        .update(workExperiences)
        .set({ order: i })
        .where(eq(workExperiences.id, remainingExps[i].id));
    }
    
    await this.updateProfileCompletionPercentage(profileId);
    return true;
  }

  // Education operations
  async getEducations(profileId: number): Promise<Education[]> {
    const educationList = await db
      .select()
      .from(educations)
      .where(eq(educations.profileId, profileId))
      .orderBy(educations.order);
      
    return educationList;
  }

  async addEducation(profileId: number, education: any): Promise<Education> {
    // Get current educations to calculate next order value
    const currentEdus = await this.getEducations(profileId);
    const nextOrder = currentEdus.length;
    
    const [newEducation] = await db
      .insert(educations)
      .values({
        profileId,
        institution: education.institution,
        degree: education.degree || null,
        field: education.field || null,
        startDate: education.startDate || null,
        endDate: education.endDate || null,
        current: education.current || false,
        description: education.description || null,
        order: nextOrder
      })
      .returning();
      
    await this.updateProfileCompletionPercentage(profileId);
    return newEducation;
  }

  async updateEducation(id: number, education: any): Promise<Education> {
    const [updatedEducation] = await db
      .update(educations)
      .set(education)
      .where(eq(educations.id, id))
      .returning();
      
    if (!updatedEducation) {
      throw new Error(`Education with ID ${id} not found`);
    }
    
    await this.updateProfileCompletionPercentage(updatedEducation.profileId);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    const [education] = await db
      .select()
      .from(educations)
      .where(eq(educations.id, id));
      
    if (!education) {
      return false;
    }
    
    const profileId = education.profileId;
    
    await db
      .delete(educations)
      .where(eq(educations.id, id));
      
    // Reorder remaining educations
    const remainingEdus = await this.getEducations(profileId);
    for (let i = 0; i < remainingEdus.length; i++) {
      await db
        .update(educations)
        .set({ order: i })
        .where(eq(educations.id, remainingEdus[i].id));
    }
    
    await this.updateProfileCompletionPercentage(profileId);
    return true;
  }

  // Resume operations
  async getResumes(userId: number): Promise<Resume[]> {
    const resumeList = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(resumes.uploadedAt);
      
    // Sort in memory since most recent should be first (descending order)
    return resumeList.sort((a, b) => {
      // Handle null dates (shouldn't happen, but just in case)
      const dateA = a.uploadedAt ? new Date(a.uploadedAt) : new Date(0);
      const dateB = b.uploadedAt ? new Date(b.uploadedAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async addResume(userId: number, resume: any): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId,
        filename: resume.filename,
        fileType: resume.fileType
      })
      .returning();
      
    return newResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));
      
    if (!resume) {
      return false;
    }
    
    await db
      .delete(resumes)
      .where(eq(resumes.id, id));
      
    return true;
  }
}

// Use DatabaseStorage instead of MemStorage
import { firestoreStorage } from './firestore-storage';

// Use Firestore storage instead of PostgreSQL
export const storage = firestoreStorage;