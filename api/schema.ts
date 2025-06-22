import { z } from "zod";

// Define Zod schemas for Firestore data validation

export const personalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  links: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),
});

export const workExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export const profileSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  skills: z.array(z.string()).optional(),
  completionPercentage: z.number().optional(),
});

export const resumeSchema = z.object({
  filename: z.string(),
  fileType: z.string(),
  uploadedAt: z.string().optional(),
});

export const questionTemplateSchema = z.object({
  category: z.string(),
  question: z.string(),
  questionType: z.string(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
  commonFields: z.any().optional(),
});

export const userAnswerSchema = z.object({
  templateId: z.number(),
  answer: z.any(),
});

// Types for Firestore data
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type WorkExperience = {
  id: number;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Education = {
  id: number;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Profile = z.infer<typeof profileSchema> & { 
  id: number; 
  userId: number; 
  createdAt?: Date; 
  updatedAt?: Date; 
};
export type Resume = z.infer<typeof resumeSchema> & { 
  id: number; 
  userId: number; 
  uploadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
export type QuestionTemplate = QuestionTemplateData & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};
export type UserAnswer = z.infer<typeof userAnswerSchema> & { id: number, userId: number };

// Insert types for creating new records
export type InsertUser = { email: string; username: string; displayName: string; password: string | null; firebaseUID: string; photoURL: string | null; authProvider: string };
export type User = InsertUser & { id: number; createdAt: Date | null; updatedAt: Date | null; lastLogin: Date | null };
export type QuestionTemplateData = {
  category: string;
  question: string;
  questionType: string;
  options?: { value: string; label: string; }[];
  description?: string;
  commonFields?: string[];
};
export type UserAnswerData = z.infer<typeof userAnswerSchema>; 