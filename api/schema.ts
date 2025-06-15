import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  authProvider: text("auth_provider"),
  firebaseUID: text("firebase_uid").unique(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile schema including all sections
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  personalInfo: jsonb("personal_info"),
  skills: jsonb("skills").$type<string[]>(),
  completionPercentage: integer("completion_percentage"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work experiences
export const workExperiences = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: boolean("current"),
  description: text("description"),
  order: integer("order"),
});

// Education
export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  institution: text("institution").notNull(),
  degree: text("degree"),
  field: text("field"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: boolean("current"),
  description: text("description"),
  order: integer("order"),
});

// Resumes
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Application question templates
export const questionTemplates = pgTable("question_templates", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),  // e.g., "work_history", "skills", "background", "legal"
  question: text("question").notNull(),
  questionType: text("question_type").notNull(), // e.g., "text", "radio", "checkbox", "date", "select"
  options: jsonb("options"), // For select, radio or checkbox questions
  description: text("description"),
  commonFields: jsonb("common_fields"), // Maps to common profile fields
});

// User answers to application questions
export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").notNull().references(() => questionTemplates.id),
  answer: jsonb("answer"), // Can store any type of answer
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define schemas with zod for validation

// Personal Info Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
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

// Work Experience Schema
export const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

// Education Schema
export const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

// Question template schema
export const questionTemplateSchema = z.object({
  id: z.number().optional(),
  category: z.string(),
  question: z.string(),
  questionType: z.enum(["text", "textarea", "radio", "checkbox", "date", "select", "number"]),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  description: z.string().optional(),
  commonFields: z.array(z.string()).optional(), // List of fields in profile this maps to
});

// User answer schema
export const userAnswerSchema = z.object({
  templateId: z.number(),
  answer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.record(z.string(), z.any())
  ]),
});

// Complete profile schema
export const profileSchema = z.object({
  personalInfo: personalInfoSchema,
  workExperiences: z.array(workExperienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  skills: z.array(z.string()).optional(),
  additionalQuestions: z.array(userAnswerSchema).optional(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
  lastLogin: true
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ 
  id: true,
  updatedAt: true
});

export const insertWorkExperienceSchema = createInsertSchema(workExperiences).omit({ 
  id: true
});

export const insertEducationSchema = createInsertSchema(educations).omit({
  id: true
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  uploadedAt: true
});

export const insertQuestionTemplateSchema = createInsertSchema(questionTemplates).omit({
  id: true
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  updatedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type WorkExperience = typeof workExperiences.$inferSelect;
export type Education = typeof educations.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type QuestionTemplate = typeof questionTemplates.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type QuestionTemplateData = z.infer<typeof questionTemplateSchema>;
export type UserAnswerData = z.infer<typeof userAnswerSchema>; 