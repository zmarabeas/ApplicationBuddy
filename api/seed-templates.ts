import { storage } from './storage.ts';
import { QuestionTemplateData } from '@shared/schema';
import { z } from 'zod';

// Template categories
const CATEGORIES = {
  WORK_HISTORY: 'work_history',
  SKILLS: 'skills',
  EDUCATION: 'education',
  PERSONAL: 'personal',
  BEHAVIORAL: 'behavioral',
  SITUATIONAL: 'situational',
};

// Question types
const QUESTION_TYPES = {
  TEXT: 'text' as const,
  TEXTAREA: 'textarea' as const,
  SELECT: 'select' as const,
  RADIO: 'radio' as const,
  CHECKBOX: 'checkbox' as const,
  DATE: 'date' as const,
  NUMBER: 'number' as const,
};

// Helper function to convert string arrays to option objects
const toOptionObjects = (options: string[]) => options.map(opt => ({ value: opt, label: opt }));

// Template data to seed the database
const templates: QuestionTemplateData[] = [
  // Work History Questions
  {
    category: CATEGORIES.WORK_HISTORY,
    question: 'What was your biggest accomplishment in your previous role?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Describe a significant achievement and its impact on the organization.',
    commonFields: ['work_experience.description']
  },
  {
    category: CATEGORIES.WORK_HISTORY,
    question: 'Why did you leave your last position?',
    questionType: QUESTION_TYPES.TEXT,
    description: 'Provide a brief explanation for your career transition.',
    commonFields: []
  },
  {
    category: CATEGORIES.WORK_HISTORY,
    question: 'How would you describe your management style?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'For management positions only.',
    commonFields: []
  },
  
  // Skills Questions
  {
    category: CATEGORIES.SKILLS,
    question: 'Rate your proficiency in Microsoft Excel',
    questionType: QUESTION_TYPES.SELECT,
    options: toOptionObjects(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    description: 'Select the option that best describes your skill level.',
    commonFields: ['skills']
  },
  {
    category: CATEGORIES.SKILLS,
    question: 'Which programming languages are you proficient in?',
    questionType: QUESTION_TYPES.CHECKBOX,
    options: toOptionObjects(['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust', 'Other']),
    description: 'Select all languages you are comfortable working with.',
    commonFields: ['skills']
  },
  {
    category: CATEGORIES.SKILLS,
    question: 'Describe your experience with project management tools',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Mention specific tools and your experience level with each.',
    commonFields: ['skills']
  },
  
  // Education Questions
  {
    category: CATEGORIES.EDUCATION,
    question: 'Why did you choose your major?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Explain what influenced your academic path.',
    commonFields: ['education.description']
  },
  {
    category: CATEGORIES.EDUCATION,
    question: 'What relevant coursework did you complete?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'List courses related to the position you are applying for.',
    commonFields: ['education.description']
  },
  
  // Personal Questions
  {
    category: CATEGORIES.PERSONAL,
    question: 'What are your salary expectations?',
    questionType: QUESTION_TYPES.TEXT,
    description: 'Provide a range or specific figure based on your experience and the market.',
    commonFields: []
  },
  {
    category: CATEGORIES.PERSONAL,
    question: 'Are you willing to relocate?',
    questionType: QUESTION_TYPES.RADIO,
    options: toOptionObjects(['Yes', 'No', 'Depends on the offer']),
    description: 'Select the option that best describes your flexibility.',
    commonFields: []
  },
  {
    category: CATEGORIES.PERSONAL,
    question: 'What is your preferred work arrangement?',
    questionType: QUESTION_TYPES.SELECT,
    options: toOptionObjects(['Remote', 'Hybrid', 'On-site', 'Flexible']),
    description: 'Select your ideal working environment.',
    commonFields: []
  },
  
  // Behavioral Questions
  {
    category: CATEGORIES.BEHAVIORAL,
    question: 'Describe a time when you had to work with a difficult colleague or client',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Explain the situation, your approach, and the outcome.',
    commonFields: []
  },
  {
    category: CATEGORIES.BEHAVIORAL,
    question: 'Tell us about a time you failed and what you learned from it',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Be honest and focus on the lessons and growth from the experience.',
    commonFields: []
  },
  {
    category: CATEGORIES.BEHAVIORAL,
    question: 'Give an example of how you set goals and achieve them',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Describe your goal-setting process and a specific achievement.',
    commonFields: []
  },
  
  // Situational Questions
  {
    category: CATEGORIES.SITUATIONAL,
    question: 'How would you handle a situation where you disagree with your manager\'s decision?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Explain your approach to professional disagreements.',
    commonFields: []
  },
  {
    category: CATEGORIES.SITUATIONAL,
    question: 'If assigned multiple urgent tasks, how would you prioritize them?',
    questionType: QUESTION_TYPES.TEXTAREA,
    description: 'Describe your method for handling competing priorities.',
    commonFields: []
  },
];

/**
 * Seed the database with question templates
 */
export async function seedTemplates() {
  console.log('Starting to seed question templates...');
  let createdCount = 0;
  
  try {
    // Get existing templates to avoid duplicates
    const existingTemplates = await storage.getQuestionTemplates();
    const existingQuestions = existingTemplates.map(t => t.question);
    
    for (const template of templates) {
      // Skip if this question already exists
      if (existingQuestions.includes(template.question)) {
        console.log(`Template with question "${template.question}" already exists, skipping...`);
        continue;
      }
      
      await storage.createQuestionTemplate(template);
      createdCount++;
    }
    
    console.log(`Successfully seeded ${createdCount} question templates.`);
  } catch (error) {
    console.error('Error seeding templates:', error);
  }
}

// Add a function to seed the database on startup
export async function seedDatabaseIfEmpty() {
  try {
    const existingTemplates = await storage.getQuestionTemplates();
    
    if (existingTemplates.length === 0) {
      console.log('No templates found in database, seeding with initial data...');
      await seedTemplates();
    } else {
      console.log(`Found ${existingTemplates.length} existing templates, skipping seed operation.`);
    }
  } catch (error) {
    console.error('Error checking database state for seeding:', error);
  }
}
