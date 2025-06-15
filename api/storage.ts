import {
  InsertUser, User, Profile, WorkExperience, Education, Resume,
  QuestionTemplate, UserAnswer, QuestionTemplateData, UserAnswerData
} from "./schema.js";

// Storage interface for type safety
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

// Use Firestore storage for all operations
import { firestoreStorage } from './firestore-storage.js';
export const storage = firestoreStorage;