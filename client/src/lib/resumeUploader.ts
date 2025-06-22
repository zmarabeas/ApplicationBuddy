/**
 * Standalone resume uploader utility
 * This file handles resume upload without any dependency on ProfileContext
 */

import { getAuth } from 'firebase/auth';

/**
 * Upload and process a resume
 * This sends the file to the server, which will:
 * 1. Parse the resume text
 * 2. Process the parsed data and add it to the user's profile
 * 3. Return the resume metadata
 */
export async function uploadResume(file: File): Promise<any> {
  // Create FormData
  const formData = new FormData();
  formData.append('resume', file);
  
  // Get Firebase authentication token
  const authToken = await getFirebaseToken();
  
  // Upload to server
  const response = await fetch('/api/resume/process', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
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
 * Get all user resumes
 */
export async function getResumes(): Promise<any[]> {
  const authToken = await getFirebaseToken();
  
  const response = await fetch('/api/resumes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch resumes');
  }
  
  const data = await response.json();
  return data.resumes || [];
}

/**
 * Delete a resume
 */
export async function deleteResume(id: number): Promise<void> {
  const authToken = await getFirebaseToken();
  
  const response = await fetch(`/api/resumes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
}

/**
 * Get the current user's Firebase token
 * This is used for authentication with the API
 */
async function getFirebaseToken(): Promise<string> {
  const auth = getAuth();
  
  // Check if user is signed in
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get token
  const token = await user.getIdToken();
  return token;
}