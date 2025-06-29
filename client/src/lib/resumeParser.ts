import { apiRequest } from "./queryClient";
import { getAuth } from "firebase/auth";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: string[];
}

// Alias for backward compatibility
export type ParsedResumeData = ParsedResume;

export interface UploadResumeResponse {
  resume: {
    id: number;
    userId: number;
    filename: string;
    fileType: string;
    uploadDate: string;
  };
  parsedData: ParsedResume;
}

/**
 * Parse a resume file and extract data
 */
export async function parseResume(file: File): Promise<ParsedResume> {
  return uploadAndParseResume(file).then(response => response.parsedData);
}

/**
 * Upload and parse a resume file
 */
export async function uploadAndParseResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  
  // Get Firebase authentication token
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  
  const response = await fetch('/api/resume/process', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload resume');
  }
  
  return response.json();
}

/**
 * Get all user's resumes
 */
export async function getUserResumes(): Promise<any[]> {
  const response = await apiRequest('GET', '/api/resumes') as Response;
  const data = await response.json();
  return data.resumes;
}

/**
 * Delete a resume
 */
export async function deleteResume(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/resumes/${id}`) as Response;
}