import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Debug logging for Firebase configuration
console.log("Firebase Config Debug:");

// Firebase configuration - using direct values instead of env vars to debug
const firebaseConfig = {
  apiKey: "AIzaSyB4L_VQDB5tI2T1HkCa0oq89jSG0mc5lIc",
  authDomain: "jobassist-xmxdx.firebaseapp.com",
  projectId: "jobassist-xmxdx",
  storageBucket: "jobassist-xmxdx.firebasestorage.app",
  messagingSenderId: "323276443955",
  appId: "1:323276443955:web:a6c9cdd4352f006dae6e46"
};

// Log the actual config (with partially masked sensitive values)
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substr(0, 5) + "..." + firebaseConfig.apiKey.substr(-5) : "[MISSING]",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? "***" + firebaseConfig.messagingSenderId.substr(-4) : "[MISSING]",
  appId: firebaseConfig.appId ? "***" + firebaseConfig.appId.substr(-8) : "[MISSING]"
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions with debugging
export const registerWithEmailPassword = async (email: string, password: string) => {
  console.log("Attempting to register with email:", email);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration successful:", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
};

export const loginWithEmailPassword = async (email: string, password: string) => {
  console.log("Attempting to login with email:", email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  console.log("Attempting Google sign-in redirect...");
  try {
    // Add an event listener to detect when the redirect happens
    window.addEventListener('beforeunload', () => {
      console.log("Redirect in progress...");
      localStorage.setItem('googleRedirectAttempt', 'true');
    }, { once: true });
    
    await signInWithRedirect(auth, googleProvider);
    return null; // This line won't be reached because of the redirect
  } catch (error: any) {
    console.error("Google redirect error:", error.code, error.message);
    throw error;
  }
};

export const getGoogleRedirectResult = async () => {
  console.log("Checking for Google redirect result...");
  try {
    // Check if we're returning from a redirect attempt
    const attemptedRedirect = localStorage.getItem('googleRedirectAttempt');
    if (attemptedRedirect) {
      console.log("Detected return from redirect");
      localStorage.removeItem('googleRedirectAttempt');
    }
    
    const result = await getRedirectResult(auth);
    console.log("Redirect result:", result ? "Success" : "No result");
    return result;
  } catch (error: any) {
    console.error("Get redirect result error:", error.code, error.message);
    throw error;
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export const updateUserProfile = (user: User, name: string, photoURL?: string) => {
  return updateProfile(user, {
    displayName: name,
    photoURL: photoURL
  });
};

export const changeUserPassword = async (user: User, currentPassword: string, newPassword: string) => {
  console.log("Attempting to change password for user:", user.email);
  try {
    // Firebase requires recent login before changing password
    // Re-authenticate user first
    if (user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log("User re-authenticated successfully");
      
      // Now change the password
      await updatePassword(user, newPassword);
      console.log("Password updated successfully");
      return true;
    } else {
      throw new Error("User email is missing");
    }
  } catch (error: any) {
    console.error("Change password error:", error.code, error.message);
    throw error;
  }
};

// Export Firebase instances
export { auth, db, storage, onAuthStateChanged };
export type { User };
