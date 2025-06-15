import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { PersonalInfo, WorkExperience, Education } from '@shared/schema';

// Define Firestore collections
const USERS_COLLECTION = 'users';
const PROFILES_COLLECTION = 'profiles';
const WORK_EXPERIENCES_COLLECTION = 'workExperiences';
const EDUCATIONS_COLLECTION = 'educations';
const RESUMES_COLLECTION = 'resumes';

// User operations
export async function createOrUpdateFirestoreUser(uid: string, userData: any) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Add created/updated timestamps
    const userDataWithTimestamps = {
      ...userData,
      updatedAt: serverTimestamp(),
    };
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // New user
      await setDoc(userRef, {
        ...userDataWithTimestamps,
        createdAt: serverTimestamp(),
      });
    } else {
      // Existing user
      await updateDoc(userRef, userDataWithTimestamps);
    }
    
    return { id: uid, ...userData };
  } catch (error) {
    console.error('Error creating/updating Firestore user:', error);
    throw error;
  }
}

export async function getFirestoreUser(uid: string) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Firestore user:', error);
    throw error;
  }
}

// Profile operations
export async function createOrUpdateFirestoreProfile(uid: string, profileData: any) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    
    // Add timestamps
    const profileDataWithTimestamps = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };
    
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) {
      // New profile
      await setDoc(profileRef, {
        ...profileDataWithTimestamps,
        userId: uid,
        createdAt: serverTimestamp(),
      });
    } else {
      // Existing profile
      await updateDoc(profileRef, profileDataWithTimestamps);
    }
    
    return { id: uid, ...profileData };
  } catch (error) {
    console.error('Error creating/updating Firestore profile:', error);
    throw error;
  }
}

export async function getFirestoreProfile(uid: string) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      return { id: profileDoc.id, ...profileDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Firestore profile:', error);
    throw error;
  }
}

export async function updateFirestorePersonalInfo(uid: string, personalInfo: PersonalInfo) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, { 
      personalInfo,
      updatedAt: serverTimestamp()
    });
    return personalInfo;
  } catch (error) {
    console.error('Error updating Firestore personal info:', error);
    throw error;
  }
}

export async function updateFirestoreSkills(uid: string, skills: string[]) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, { 
      skills,
      updatedAt: serverTimestamp()
    });
    return skills;
  } catch (error) {
    console.error('Error updating Firestore skills:', error);
    throw error;
  }
}

// Work Experience operations
export async function addFirestoreWorkExperience(uid: string, workExp: WorkExperience) {
  try {
    // Create a unique ID by combining user ID and timestamp
    const timestamp = new Date().getTime();
    const workExpId = `${uid}_${timestamp}`;
    
    const workExpRef = doc(db, WORK_EXPERIENCES_COLLECTION, workExpId);
    await setDoc(workExpRef, {
      ...workExp,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: workExpId, ...workExp };
  } catch (error) {
    console.error('Error adding Firestore work experience:', error);
    throw error;
  }
}

export async function updateFirestoreWorkExperience(workExpId: string, workExp: Partial<WorkExperience>) {
  try {
    const workExpRef = doc(db, WORK_EXPERIENCES_COLLECTION, workExpId);
    await updateDoc(workExpRef, {
      ...workExp,
      updatedAt: serverTimestamp()
    });
    
    return { id: workExpId, ...workExp };
  } catch (error) {
    console.error('Error updating Firestore work experience:', error);
    throw error;
  }
}

export async function deleteFirestoreWorkExperience(workExpId: string) {
  try {
    const workExpRef = doc(db, WORK_EXPERIENCES_COLLECTION, workExpId);
    await deleteDoc(workExpRef);
    return true;
  } catch (error) {
    console.error('Error deleting Firestore work experience:', error);
    throw error;
  }
}

export async function getFirestoreWorkExperiences(uid: string) {
  try {
    const workExpsQuery = query(
      collection(db, WORK_EXPERIENCES_COLLECTION),
      where('userId', '==', uid)
    );
    
    const querySnapshot = await getDocs(workExpsQuery);
    const workExperiences: any[] = [];
    
    querySnapshot.forEach((doc) => {
      workExperiences.push({ id: doc.id, ...doc.data() });
    });
    
    return workExperiences;
  } catch (error) {
    console.error('Error getting Firestore work experiences:', error);
    throw error;
  }
}

// Education operations
export async function addFirestoreEducation(uid: string, education: Education) {
  try {
    // Create a unique ID by combining user ID and timestamp
    const timestamp = new Date().getTime();
    const educationId = `${uid}_${timestamp}`;
    
    const educationRef = doc(db, EDUCATIONS_COLLECTION, educationId);
    await setDoc(educationRef, {
      ...education,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: educationId, ...education };
  } catch (error) {
    console.error('Error adding Firestore education:', error);
    throw error;
  }
}

export async function updateFirestoreEducation(educationId: string, education: Partial<Education>) {
  try {
    const educationRef = doc(db, EDUCATIONS_COLLECTION, educationId);
    await updateDoc(educationRef, {
      ...education,
      updatedAt: serverTimestamp()
    });
    
    return { id: educationId, ...education };
  } catch (error) {
    console.error('Error updating Firestore education:', error);
    throw error;
  }
}

export async function deleteFirestoreEducation(educationId: string) {
  try {
    const educationRef = doc(db, EDUCATIONS_COLLECTION, educationId);
    await deleteDoc(educationRef);
    return true;
  } catch (error) {
    console.error('Error deleting Firestore education:', error);
    throw error;
  }
}

export async function getFirestoreEducations(uid: string) {
  try {
    const educationsQuery = query(
      collection(db, EDUCATIONS_COLLECTION),
      where('userId', '==', uid)
    );
    
    const querySnapshot = await getDocs(educationsQuery);
    const educations: any[] = [];
    
    querySnapshot.forEach((doc) => {
      educations.push({ id: doc.id, ...doc.data() });
    });
    
    return educations;
  } catch (error) {
    console.error('Error getting Firestore educations:', error);
    throw error;
  }
}

// Resume operations
export async function addFirestoreResume(uid: string, resumeData: any) {
  try {
    // Create a unique ID
    const timestamp = new Date().getTime();
    const resumeId = `${uid}_${timestamp}`;
    
    const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
    await setDoc(resumeRef, {
      ...resumeData,
      userId: uid,
      uploadedAt: serverTimestamp()
    });
    
    return { id: resumeId, ...resumeData };
  } catch (error) {
    console.error('Error adding Firestore resume:', error);
    throw error;
  }
}

export async function deleteFirestoreResume(resumeId: string) {
  try {
    const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
    await deleteDoc(resumeRef);
    return true;
  } catch (error) {
    console.error('Error deleting Firestore resume:', error);
    throw error;
  }
}

export async function getFirestoreResumes(uid: string) {
  try {
    const resumesQuery = query(
      collection(db, RESUMES_COLLECTION),
      where('userId', '==', uid)
    );
    
    const querySnapshot = await getDocs(resumesQuery);
    const resumes: any[] = [];
    
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });
    
    return resumes;
  } catch (error) {
    console.error('Error getting Firestore resumes:', error);
    throw error;
  }
}