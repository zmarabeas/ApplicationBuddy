import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { IStorage } from './storage.js';
import { 
  InsertUser, User, Profile, WorkExperience, Education, Resume,
  QuestionTemplate, UserAnswer, QuestionTemplateData, UserAnswerData
} from './schema.js';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const credentialObject: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "jobassist-xmxdx",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(credentialObject),
  });
}

// Get Firestore instance
const db = getFirestore();

// Define Firestore collections
const USERS_COLLECTION = 'users';
const PROFILES_COLLECTION = 'profiles';
const WORK_EXPERIENCES_COLLECTION = 'workExperiences';
const EDUCATIONS_COLLECTION = 'educations';
const RESUMES_COLLECTION = 'resumes';
const QUESTION_TEMPLATES_COLLECTION = 'questionTemplates';
const USER_ANSWERS_COLLECTION = 'userAnswers';

// Add transaction helper
async function runInTransaction<T>(operation: (transaction: FirebaseFirestore.Transaction) => Promise<T>): Promise<T> {
  try {
    return await db.runTransaction(operation);
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

export class FirestoreStorage implements IStorage {
  // This allows us to use session-related functions from Express
  sessionStore: any = {
    // Session store methods not needed when using Firebase auth
    // This is just a placeholder to satisfy the interface
  };

  /**
   * Process a parsed resume data in a transaction to prevent duplication
   * This is a critical method to prevent the resume upload duplication issue
   */
  async processResumeDataInTransaction(
    userId: number,
    resumeData: {
      filename: string;
      fileType: string;
      parsedData: any;
    }
  ): Promise<{ resumeId: number; profileUpdated: boolean }> {
    try {
      // Get profile
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error(`Profile not found for user ID: ${userId}`);
      }

      // Pre-fetch all the data we'll need to make comparisons outside the transaction
      console.log(`Pre-fetching data for profile ${profile.id} to prevent transaction read-after-write errors`);
      
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profile.id.toString());
      const profileDoc = await profileRef.get();
      const profileData = profileDoc.data() || {};
      const currentSkills = profileData.skills || [];
      
      // Get existing work experiences for comparison
      const workExpsSnapshot = await db.collection(WORK_EXPERIENCES_COLLECTION)
        .where('profileId', '==', profile.id)
        .get();
      const existingWorkExps = workExpsSnapshot.docs.map(doc => doc.data());
      
      // Get existing educations for comparison
      const educationsSnapshot = await db.collection(EDUCATIONS_COLLECTION)
        .where('profileId', '==', profile.id)
        .get();
      const existingEducations = educationsSnapshot.docs.map(doc => doc.data());
      
      // Pre-process skills data
      let skillsToUpdate = null;
      if (resumeData.parsedData.skills && resumeData.parsedData.skills.length > 0) {
        // Normalize skills
        const validSkills = resumeData.parsedData.skills.filter((skill: any) => 
          typeof skill === 'string' && skill.trim().length > 0
        );
        
        const normalizedNewSkills = validSkills.map((skill: string) => 
          typeof skill === 'string' ? skill.toLowerCase().trim() : ''
        );
        
        const normalizedCurrentSkills = currentSkills.map((skill: any) => 
          typeof skill === 'string' ? skill.toLowerCase().trim() : ''
        );
        
        // Find new skills
        const newSkillsIndexes = [];
        for (let i = 0; i < normalizedNewSkills.length; i++) {
          if (!normalizedCurrentSkills.includes(normalizedNewSkills[i])) {
            newSkillsIndexes.push(i);
          }
        }
        
        // Prepare combined skills if needed
        if (newSkillsIndexes.length > 0) {
          skillsToUpdate = [...currentSkills];
          for (const index of newSkillsIndexes) {
            skillsToUpdate.push(validSkills[index]);
          }
        }
      }
      
      // Now run the transaction with all processing decisions already made
      const result = await db.runTransaction(async (transaction) => {
        // 1. Add the resume record
        const resumeRef = db.collection(RESUMES_COLLECTION).doc();
        const resumeId = parseInt(resumeRef.id, 36) % 100000000; // Generate a numeric ID
        
        transaction.set(resumeRef, {
          id: resumeId,
          userId,
          filename: resumeData.filename,
          fileType: resumeData.fileType,
          uploadedAt: FieldValue.serverTimestamp()
        });

        // 2. Update personal info if available
        if (resumeData.parsedData.personalInfo) {
          transaction.update(profileRef, {
            personalInfo: resumeData.parsedData.personalInfo,
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        // 3. Process work experiences (using pre-fetched data for comparison)
        if (resumeData.parsedData.workExperiences && resumeData.parsedData.workExperiences.length > 0) {          
          for (const workExp of resumeData.parsedData.workExperiences) {
            // Normalize for comparison
            const normalizedCompany = (workExp.company || '').toLowerCase().trim();
            const normalizedTitle = (workExp.title || '').toLowerCase().trim();
            
            // Check for duplicates using our pre-fetched data
            const isDuplicate = existingWorkExps.some(existing => {
              const existingCompany = (existing.company || '').toLowerCase().trim();
              const existingTitle = (existing.title || '').toLowerCase().trim();
              return existingCompany === normalizedCompany && existingTitle === normalizedTitle;
            });
            
            // Only add if not a duplicate
            if (!isDuplicate) {
              const workExpRef = db.collection(WORK_EXPERIENCES_COLLECTION).doc();
              const workExpId = parseInt(workExpRef.id, 36) % 100000000;
              
              transaction.set(workExpRef, {
                id: workExpId,
                profileId: profile.id,
                userId: userId, // Add user ID as well
                company: workExp.company,
                title: workExp.title,
                location: workExp.location || null,
                startDate: workExp.startDate || null,
                endDate: workExp.endDate || null,
                current: workExp.current || false,
                description: workExp.description || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
              });
            }
          }
        }

        // 4. Process educations (using pre-fetched data for comparison)
        if (resumeData.parsedData.educations && resumeData.parsedData.educations.length > 0) {          
          for (const education of resumeData.parsedData.educations) {
            // Normalize for comparison
            const normalizedInstitution = (education.institution || '').toLowerCase().trim();
            const normalizedDegree = (education.degree || '').toLowerCase().trim();
            
            // Check for duplicates using our pre-fetched data
            const isDuplicate = existingEducations.some(existing => {
              const existingInstitution = (existing.institution || '').toLowerCase().trim();
              const existingDegree = (existing.degree || '').toLowerCase().trim();
              return existingInstitution === normalizedInstitution && existingDegree === normalizedDegree;
            });
            
            // Only add if not a duplicate
            if (!isDuplicate) {
              const educationRef = db.collection(EDUCATIONS_COLLECTION).doc();
              const educationId = parseInt(educationRef.id, 36) % 100000000;
              
              transaction.set(educationRef, {
                id: educationId,
                profileId: profile.id,
                userId: userId, // Add user ID as well
                institution: education.institution,
                degree: education.degree || null,
                field: education.field || null,
                startDate: education.startDate || null,
                endDate: education.endDate || null,
                current: education.current || false,
                description: education.description || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
              });
            }
          }
        }

        // 5. Update skills if needed (using pre-computed value)
        if (skillsToUpdate) {
          transaction.update(profileRef, {
            skills: skillsToUpdate,
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        return {
          resumeId: resumeId,
          profileUpdated: true
        };
      });

      // After successful transaction, update the profile completion percentage
      try {
        // Update profile completion percentage
        await this.updateProfileCompletionPercentage(profile.id);
        console.log(`Updated profile completion percentage for profile ID: ${profile.id}`);
      } catch (completionError) {
        console.error('Error updating profile completion percentage:', completionError);
        // We don't want to fail the whole operation if just the completion update fails
      }
      
      return result;
    } catch (error) {
      console.error('Error processing resume data in transaction:', error);
      throw error;
    }
  }
  
  async resetUserProfile(userId: number): Promise<boolean> {
    try {
      console.log(`Resetting profile for user ID: ${userId}`);
      
      // Get profile
      const profile = await this.getProfile(userId);
      if (!profile) {
        console.error(`Profile not found for user ID: ${userId}`);
        return false;
      }
      
      const profileId = profile.id;
      console.log(`Found profile ID: ${profileId}`);
      
      // 1. Delete all work experiences
      const workExperiences = await this.getWorkExperiences(profileId);
      for (const workExp of workExperiences) {
        await db.collection(WORK_EXPERIENCES_COLLECTION).doc(workExp.id.toString()).delete();
        console.log(`Deleted work experience ID: ${workExp.id}`);
      }
      
      // 2. Delete all educations
      const educations = await this.getEducations(profileId);
      for (const education of educations) {
        await db.collection(EDUCATIONS_COLLECTION).doc(education.id.toString()).delete();
        console.log(`Deleted education ID: ${education.id}`);
      }
      
      // 3. Delete all resumes
      const resumes = await this.getResumes(userId);
      for (const resume of resumes) {
        await db.collection(RESUMES_COLLECTION).doc(resume.id.toString()).delete();
        console.log(`Deleted resume ID: ${resume.id}`);
      }
      
      // 4. Reset profile data
      await db.collection(PROFILES_COLLECTION).doc(profileId.toString()).update({
        personalInfo: null,
        skills: null,
        completionPercentage: 0,
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`Successfully reset profile for user ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error resetting profile:', error);
      return false;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      // In Firestore, we'll search by the auto-incrementing ID field
      const usersRef = db.collection(USERS_COLLECTION);
      const snapshot = await usersRef.where('id', '==', id).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      return { id, ...userData } as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = db.collection(USERS_COLLECTION);
      const snapshot = await usersRef.where('username', '==', username).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      return { id: userData.id, ...userData } as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const usersRef = db.collection(USERS_COLLECTION);
      const snapshot = await usersRef.where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      return { id: userData.id, ...userData } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    try {
      const usersRef = db.collection(USERS_COLLECTION);
      const snapshot = await usersRef.where('firebaseUID', '==', firebaseUID).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      return { id: userData.id, ...userData } as User;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    return runInTransaction(async (transaction) => {
      // Get the next ID
      const counterRef = db.collection('counters').doc('users');
      const counterDoc = await transaction.get(counterRef);
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      transaction.set(counterRef, { value: nextId });
      
      // Create the user with the auto-incrementing ID
      const newUser = {
        ...user,
        id: nextId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      const userRef = db.collection(USERS_COLLECTION).doc(nextId.toString());
      transaction.set(userRef, newUser);
      
      return { 
        ...newUser, 
        lastLogin: null, 
        createdAt: null, 
        updatedAt: null 
      } as unknown as User;
    });
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const userRef = db.collection(USERS_COLLECTION).doc(id.toString());
      const snapshot = await userRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      const updatedData = {
        ...userData,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await userRef.update(updatedData);
      
      const updatedUser = {
        ...snapshot.data(),
        ...updatedData,
        id,
        updatedAt: new Date(),
        createdAt: snapshot.data()?.createdAt?.toDate() || null,
        lastLogin: snapshot.data()?.lastLogin?.toDate() || null
      };
      
      return updatedUser as unknown as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Profile operations
  async getProfile(userId: number): Promise<Profile | undefined> {
    try {
      const profilesRef = db.collection(PROFILES_COLLECTION);
      const snapshot = await profilesRef.where('userId', '==', userId).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const profileData = snapshot.docs[0].data();
      return { id: profileData.id, ...profileData } as Profile;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  async createProfile(userId: number): Promise<Profile> {
    try {
      // Get the next ID
      const counterDoc = await db.collection('counters').doc('profiles').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      await db.collection('counters').doc('profiles').set({ value: nextId });
      
      // Create the profile
      const newProfile = {
        id: nextId,
        userId,
        personalInfo: null,
        skills: [],
        completionPercentage: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection(PROFILES_COLLECTION).doc(nextId.toString()).set(newProfile);
      
      // Use type assertion to handle Firestore timestamp vs Date typing
      return { 
        ...newProfile, 
        updatedAt: null, 
        createdAt: null 
      } as unknown as Profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(profileId: number, data: Partial<Profile>): Promise<Profile> {
    try {
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const snapshot = await profileRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const updatedData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await profileRef.update(updatedData);
      
      const updatedProfile = {
        ...snapshot.data(),
        ...updatedData,
        id: profileId
      };
      
      // Use type assertion to handle Firestore timestamp vs Date typing
      return updatedProfile as unknown as Profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePersonalInfo(profileId: number, personalInfo: any): Promise<Profile> {
    try {
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const snapshot = await profileRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const updatedData = {
        personalInfo,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await profileRef.update(updatedData);
      
      // Calculate completion percentage after update
      const completionPercentage = await this.updateProfileCompletionPercentage(profileId);
      
      const updatedProfile = {
        ...snapshot.data(),
        ...updatedData,
        completionPercentage,
        id: profileId
      };
      
      // Use type assertion to handle Firestore timestamp vs Date typing
      return updatedProfile as unknown as Profile;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  }

  async updateSkills(profileId: number, skills: string[]): Promise<Profile> {
    try {
      // Validate skills input
      if (!Array.isArray(skills)) {
        throw new Error('Skills must be an array');
      }

      // Normalize skills - filter out non-string values and empty strings
      const normalizedSkills = skills
        .filter(skill => typeof skill === 'string' && skill.trim() !== '')
        .map(skill => skill.trim());

      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const snapshot = await profileRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      // Log what we're updating
      console.log(`Updating ${normalizedSkills.length} normalized skills for profile ${profileId}`);
      
      const updatedData = {
        skills: normalizedSkills,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await profileRef.update(updatedData);
      
      // Calculate completion percentage after update
      const completionPercentage = await this.updateProfileCompletionPercentage(profileId);
      
      const updatedProfile = {
        ...snapshot.data(),
        skills: normalizedSkills, // Ensure we use our normalized array
        completionPercentage,
        id: profileId,
        updatedAt: new Date() // Convert Firestore timestamp to Date for the return value
      };
      
      // Use type assertion to handle Firestore timestamp vs Date typing
      return updatedProfile as unknown as Profile;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  }

  async updateProfileCompletionPercentage(profileId: number): Promise<number> {
    return runInTransaction(async (transaction) => {
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const profileDoc = await transaction.get(profileRef);
      
      if (!profileDoc.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const profileData = profileDoc.data();
      let completionPercentage = 0;
      let totalFields = 0;
      let completedFields = 0;
      
      // Check personal info
      if (profileData?.personalInfo) {
        const personalInfo = profileData.personalInfo;
        
        // Basic info
        totalFields += 4;
        if (personalInfo.firstName) completedFields++;
        if (personalInfo.lastName) completedFields++;
        if (personalInfo.email) completedFields++;
        if (personalInfo.phone) completedFields++;
        
        // Address
        if (personalInfo.address) {
          totalFields += 5;
          if (personalInfo.address.street) completedFields++;
          if (personalInfo.address.city) completedFields++;
          if (personalInfo.address.state) completedFields++;
          if (personalInfo.address.zip) completedFields++;
          if (personalInfo.address.country) completedFields++;
        }
        
        // Links
        if (personalInfo.links) {
          totalFields += 3;
          if (personalInfo.links.linkedin) completedFields++;
          if (personalInfo.links.github) completedFields++;
          if (personalInfo.links.portfolio) completedFields++;
        }
      }
      
      // Check skills array - ensure it's properly typed and has valid content
      if (profileData?.skills && Array.isArray(profileData.skills)) {
        const validSkills = profileData.skills.filter(skill => 
          typeof skill === 'string' && skill.trim().length > 0
        );
        
        if (validSkills.length > 0) {
          totalFields += 1;
          completedFields += 1;
          console.log(`Profile ${profileId} has ${validSkills.length} valid skills`);
        } else {
          console.log(`Profile ${profileId} has skills array but no valid skills`);
          totalFields += 1; // Still count the field in total
        }
      }
      
      // Check work experiences
      const workExpsRef = db.collection(WORK_EXPERIENCES_COLLECTION);
      const workExpsSnapshot = await workExpsRef.where('userId', '==', profileData?.userId).get();
      
      if (!workExpsSnapshot.empty) {
        totalFields += 1;
        completedFields += 1;
      }
      
      // Check educations
      const educationsRef = db.collection(EDUCATIONS_COLLECTION);
      const educationsSnapshot = await educationsRef.where('userId', '==', profileData?.userId).get();
      
      if (!educationsSnapshot.empty) {
        totalFields += 1;
        completedFields += 1;
      }
      
      // Calculate percentage
      if (totalFields > 0) {
        completionPercentage = Math.round((completedFields / totalFields) * 100);
      }
      
      // Update the profile with new completion percentage
      transaction.update(profileRef, {
        completionPercentage,
        updatedAt: FieldValue.serverTimestamp()
      });
      
      return completionPercentage;
    });
  }

  // Work Experience operations
  async getWorkExperiences(profileId: number): Promise<WorkExperience[]> {
    try {
      // First get the profile to get the user ID
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const profileSnapshot = await profileRef.get();
      
      if (!profileSnapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const userId = profileSnapshot.data()?.userId;
      
      const workExpsRef = db.collection(WORK_EXPERIENCES_COLLECTION);
      const snapshot = await workExpsRef.where('userId', '==', userId).get();
      
      const workExperiences: WorkExperience[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        workExperiences.push({
          id: parseInt(doc.id),
          ...data
        } as WorkExperience);
      });
      
      return workExperiences;
    } catch (error) {
      console.error('Error getting work experiences:', error);
      throw error;
    }
  }

  async addWorkExperience(profileId: number, workExp: any): Promise<WorkExperience> {
    try {
      // First get the profile to get the user ID
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const profileSnapshot = await profileRef.get();
      
      if (!profileSnapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const userId = profileSnapshot.data()?.userId;
      
      // Get the next ID
      const counterDoc = await db.collection('counters').doc('workExperiences').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      await db.collection('counters').doc('workExperiences').set({ value: nextId });
      
      // Create the work experience
      const newWorkExp = {
        ...workExp,
        id: nextId,
        userId,
        profileId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection(WORK_EXPERIENCES_COLLECTION).doc(nextId.toString()).set(newWorkExp);
      
      // Update profile completion percentage
      await this.updateProfileCompletionPercentage(profileId);
      
      return newWorkExp as WorkExperience;
    } catch (error) {
      console.error('Error adding work experience:', error);
      throw error;
    }
  }

  async updateWorkExperience(id: number, workExp: any): Promise<WorkExperience> {
    try {
      const workExpRef = db.collection(WORK_EXPERIENCES_COLLECTION).doc(id.toString());
      const snapshot = await workExpRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Work experience with ID ${id} not found`);
      }
      
      const updatedData = {
        ...workExp,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await workExpRef.update(updatedData);
      
      // Get profile ID to update completion percentage
      const profileId = snapshot.data()?.profileId;
      if (profileId) {
        await this.updateProfileCompletionPercentage(profileId);
      }
      
      const updatedWorkExp = {
        ...snapshot.data(),
        ...updatedData,
        id
      };
      
      return updatedWorkExp as WorkExperience;
    } catch (error) {
      console.error('Error updating work experience:', error);
      throw error;
    }
  }

  async deleteWorkExperience(id: number): Promise<boolean> {
    try {
      const workExpRef = db.collection(WORK_EXPERIENCES_COLLECTION).doc(id.toString());
      const snapshot = await workExpRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Work experience with ID ${id} not found`);
      }
      
      // Get profile ID to update completion percentage later
      const profileId = snapshot.data()?.profileId;
      
      await workExpRef.delete();
      
      // Update profile completion percentage
      if (profileId) {
        await this.updateProfileCompletionPercentage(profileId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting work experience:', error);
      throw error;
    }
  }

  // Education operations
  async getEducations(profileId: number): Promise<Education[]> {
    try {
      // First get the profile to get the user ID
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const profileSnapshot = await profileRef.get();
      
      if (!profileSnapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const userId = profileSnapshot.data()?.userId;
      
      const educationsRef = db.collection(EDUCATIONS_COLLECTION);
      const snapshot = await educationsRef.where('userId', '==', userId).get();
      
      const educations: Education[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        educations.push({
          id: parseInt(doc.id),
          ...data
        } as Education);
      });
      
      return educations;
    } catch (error) {
      console.error('Error getting educations:', error);
      throw error;
    }
  }

  async addEducation(profileId: number, education: any): Promise<Education> {
    try {
      // First get the profile to get the user ID
      const profileRef = db.collection(PROFILES_COLLECTION).doc(profileId.toString());
      const profileSnapshot = await profileRef.get();
      
      if (!profileSnapshot.exists) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      const userId = profileSnapshot.data()?.userId;
      
      // Get the next ID
      const counterDoc = await db.collection('counters').doc('educations').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      await db.collection('counters').doc('educations').set({ value: nextId });
      
      // Create the education
      const newEducation = {
        ...education,
        id: nextId,
        userId,
        profileId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection(EDUCATIONS_COLLECTION).doc(nextId.toString()).set(newEducation);
      
      // Update profile completion percentage
      await this.updateProfileCompletionPercentage(profileId);
      
      return newEducation as Education;
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  }

  async updateEducation(id: number, education: any): Promise<Education> {
    try {
      const educationRef = db.collection(EDUCATIONS_COLLECTION).doc(id.toString());
      const snapshot = await educationRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Education with ID ${id} not found`);
      }
      
      const updatedData = {
        ...education,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await educationRef.update(updatedData);
      
      // Get profile ID to update completion percentage
      const profileId = snapshot.data()?.profileId;
      if (profileId) {
        await this.updateProfileCompletionPercentage(profileId);
      }
      
      const updatedEducation = {
        ...snapshot.data(),
        ...updatedData,
        id
      };
      
      return updatedEducation as Education;
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  }

  async deleteEducation(id: number): Promise<boolean> {
    try {
      const educationRef = db.collection(EDUCATIONS_COLLECTION).doc(id.toString());
      const snapshot = await educationRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Education with ID ${id} not found`);
      }
      
      // Get profile ID to update completion percentage later
      const profileId = snapshot.data()?.profileId;
      
      await educationRef.delete();
      
      // Update profile completion percentage
      if (profileId) {
        await this.updateProfileCompletionPercentage(profileId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  }

  // Resume operations
  async getResumes(userId: number): Promise<Resume[]> {
    try {
      const resumesRef = db.collection(RESUMES_COLLECTION);
      const snapshot = await resumesRef.where('userId', '==', userId).get();
      
      const resumes: Resume[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamp to string date
        let uploadedAt = data.uploadedAt;
        if (uploadedAt && typeof uploadedAt.toDate === 'function') {
          uploadedAt = uploadedAt.toDate().toISOString();
        }
        
        resumes.push({
          id: parseInt(doc.id),
          ...data,
          uploadedAt
        } as Resume);
      });
      
      return resumes;
    } catch (error) {
      console.error('Error getting resumes:', error);
      throw error;
    }
  }

  async addResume(userId: number, resume: any): Promise<Resume> {
    try {
      // Get the next ID
      const counterDoc = await db.collection('counters').doc('resumes').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      await db.collection('counters').doc('resumes').set({ value: nextId });
      
      // Create the resume
      const newResume = {
        ...resume,
        id: nextId,
        userId,
        uploadedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection(RESUMES_COLLECTION).doc(nextId.toString()).set(newResume);
      
      // Convert the Firestore timestamp for the response
      return {
        ...newResume,
        uploadedAt: new Date().toISOString() // Use current date as an approximation
      } as Resume;
    } catch (error) {
      console.error('Error adding resume:', error);
      throw error;
    }
  }

  async deleteResume(id: number): Promise<boolean> {
    try {
      const resumeRef = db.collection(RESUMES_COLLECTION).doc(id.toString());
      const snapshot = await resumeRef.get();
      
      if (!snapshot.exists) {
        throw new Error(`Resume with ID ${id} not found`);
      }
      
      await resumeRef.delete();
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  // Question Template operations
  async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    try {
      const templatesRef = db.collection(QUESTION_TEMPLATES_COLLECTION);
      const snapshot = await templatesRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          ...data
        } as QuestionTemplate;
      });
    } catch (error) {
      console.error('Error getting question templates:', error);
      throw error;
    }
  }

  async getQuestionTemplatesByCategory(category: string): Promise<QuestionTemplate[]> {
    try {
      const templatesRef = db.collection(QUESTION_TEMPLATES_COLLECTION);
      const snapshot = await templatesRef.where('category', '==', category).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          ...data
        } as QuestionTemplate;
      });
    } catch (error) {
      console.error(`Error getting question templates by category '${category}':`, error);
      throw error;
    }
  }

  async getQuestionTemplate(id: number): Promise<QuestionTemplate | undefined> {
    try {
      const templateRef = db.collection(QUESTION_TEMPLATES_COLLECTION).doc(id.toString());
      const doc = await templateRef.get();
      
      if (!doc.exists) {
        return undefined;
      }
      
      const data = doc.data();
      return {
        id,
        ...data
      } as QuestionTemplate;
    } catch (error) {
      console.error(`Error getting question template with ID ${id}:`, error);
      throw error;
    }
  }

  async createQuestionTemplate(template: QuestionTemplateData): Promise<QuestionTemplate> {
    try {
      // Get the next ID
      const counterDoc = await db.collection('counters').doc('questionTemplates').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update the counter
      await db.collection('counters').doc('questionTemplates').set({ value: nextId });
      
      const templateData = {
        id: nextId,
        category: template.category,
        question: template.question,
        questionType: template.questionType,
        options: template.options || null,
        description: template.description || null,
        commonFields: template.commonFields || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection(QUESTION_TEMPLATES_COLLECTION).doc(nextId.toString()).set(templateData);
      
      return {
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as QuestionTemplate;
    } catch (error) {
      console.error('Error creating question template:', error);
      throw error;
    }
  }

  async updateQuestionTemplate(id: number, template: Partial<QuestionTemplateData>): Promise<QuestionTemplate> {
    try {
      const templateRef = db.collection(QUESTION_TEMPLATES_COLLECTION).doc(id.toString());
      const doc = await templateRef.get();
      
      if (!doc.exists) {
        throw new Error(`Question template with ID ${id} not found`);
      }
      
      const updateData = {
        ...template,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await templateRef.update(updateData);
      
      const updatedDoc = await templateRef.get();
      const data = updatedDoc.data();
      
      return {
        id,
        ...data
      } as QuestionTemplate;
    } catch (error) {
      console.error(`Error updating question template with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteQuestionTemplate(id: number): Promise<boolean> {
    try {
      const templateRef = db.collection(QUESTION_TEMPLATES_COLLECTION).doc(id.toString());
      const doc = await templateRef.get();
      
      if (!doc.exists) {
        return false;
      }
      
      await templateRef.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting question template with ID ${id}:`, error);
      throw error;
    }
  }

  // User Answer operations
  async getUserAnswers(userId: number): Promise<UserAnswer[]> {
    try {
      const answersRef = db.collection(USER_ANSWERS_COLLECTION);
      const snapshot = await answersRef.where('userId', '==', userId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          ...data
        } as UserAnswer;
      });
    } catch (error) {
      console.error(`Error getting user answers for user ID ${userId}:`, error);
      throw error;
    }
  }

  async getUserAnswer(userId: number, templateId: number): Promise<UserAnswer | undefined> {
    try {
      const answersRef = db.collection(USER_ANSWERS_COLLECTION);
      const snapshot = await answersRef
        .where('userId', '==', userId)
        .where('templateId', '==', templateId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: parseInt(doc.id),
        ...data
      } as UserAnswer;
    } catch (error) {
      console.error(`Error getting user answer for user ID ${userId} and template ID ${templateId}:`, error);
      throw error;
    }
  }

  async saveUserAnswer(userId: number, answer: UserAnswerData): Promise<UserAnswer> {
    try {
      // Check if answer already exists
      const existingAnswer = await this.getUserAnswer(userId, answer.templateId);
      
      if (existingAnswer) {
        // Update existing answer
        return this.updateUserAnswer(existingAnswer.id, { answer: answer.answer });
      } else {
        // Get the next ID
        const counterDoc = await db.collection('counters').doc('userAnswers').get();
        let nextId = 1;
        
        if (counterDoc.exists) {
          nextId = (counterDoc.data()?.value || 0) + 1;
        }
        
        // Update the counter
        await db.collection('counters').doc('userAnswers').set({ value: nextId });
        
        const answerData = {
          id: nextId,
          userId,
          templateId: answer.templateId,
          answer: answer.answer,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        
        await db.collection(USER_ANSWERS_COLLECTION).doc(nextId.toString()).set(answerData);
        
        return {
          ...answerData,
          createdAt: new Date(),
          updatedAt: new Date()
        } as UserAnswer;
      }
    } catch (error) {
      console.error(`Error saving user answer for user ID ${userId}:`, error);
      throw error;
    }
  }

  async updateUserAnswer(id: number, answer: Partial<UserAnswerData>): Promise<UserAnswer> {
    try {
      const answerRef = db.collection(USER_ANSWERS_COLLECTION).doc(id.toString());
      const doc = await answerRef.get();
      
      if (!doc.exists) {
        throw new Error(`User answer with ID ${id} not found`);
      }
      
      const updateData = {
        ...answer,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await answerRef.update(updateData);
      
      const updatedDoc = await answerRef.get();
      const data = updatedDoc.data();
      
      return {
        id,
        ...data
      } as UserAnswer;
    } catch (error) {
      console.error(`Error updating user answer with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserAnswer(id: number): Promise<boolean> {
    try {
      const answerRef = db.collection(USER_ANSWERS_COLLECTION).doc(id.toString());
      const doc = await answerRef.get();
      
      if (!doc.exists) {
        return false;
      }
      
      await answerRef.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting user answer with ID ${id}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance of the Firestore storage
export const firestoreStorage = new FirestoreStorage();