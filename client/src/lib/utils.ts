import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return date;
  }
}

export function calculateProfileCompletionPercentage(profile: any): number {
  if (!profile) return 0;
  
  let completionPoints = 0;
  let totalPoints = 4; // Four sections: personal info, work exp, education, skills
  
  // Check personal info
  if (profile.personalInfo) {
    completionPoints += 1;
  }
  
  // Check work experiences
  if (profile.workExperiences && profile.workExperiences.length > 0) {
    completionPoints += 1;
  }
  
  // Check education
  if (profile.educations && profile.educations.length > 0) {
    completionPoints += 1;
  }
  
  // Check skills
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    completionPoints += 1;
  }
  
  return Math.round((completionPoints / totalPoints) * 100);
}

// Function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Function to get initials from name
export function getInitials(name: string): string {
  if (!name) return "";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Function to format phone number
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  
  // Strip non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber;
}
