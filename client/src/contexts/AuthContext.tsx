import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  auth, 
  onAuthStateChanged, 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  loginWithGoogle as firebaseLoginWithGoogle,
  getGoogleRedirectResult,
  logoutUser,
  changeUserPassword,
  User
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCredential } from "firebase/auth";

// Helper function for debugging auth errors
function getReadableAuthError(errorCode: string): string {
  // Handle missing or empty error code
  if (!errorCode) return 'An unknown authentication error occurred';
  
  const errorMap: Record<string, string> = {
    'auth/invalid-email': 'Invalid email format.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email is already in use.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'Password is too weak.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email.',
    'auth/auth-domain-config-required': 'Authentication domain configuration is required.',
    'auth/cancelled-popup-request': 'The popup authentication request was cancelled.',
    'auth/popup-blocked': 'Authentication popup was blocked by the browser.',
    'auth/popup-closed-by-user': 'Authentication popup was closed by the user.',
    'auth/unauthorized-domain': 'The domain is not authorized for OAuth operations.',
    'auth/invalid-action-code': 'Invalid action code.',
    'auth/api-key-not-valid': 'Firebase API key is not valid. Check your Firebase project configuration.',
    'auth/app-not-authorized': 'Firebase app is not authorized.'
  };
  
  // Clean up any periods and make lowercase for matching
  const cleanErrorCode = errorCode.toLowerCase().replace(/\./g, '');
  
  // Find a matching error code, even partial match
  for (const code in errorMap) {
    if (cleanErrorCode.includes(code.replace('auth/', ''))) {
      return errorMap[code];
    }
  }
  
  console.log("Unrecognized error code:", errorCode);
  return 'An unknown authentication error occurred. Please try again.';
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    
    // Set up Firebase auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
      
      setCurrentUser(user);
      
      if (user) {
        console.log("User is signed in with Firebase:", user.uid);
        try {
          // Log additional user info for debugging
          console.log("User details:", {
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: user.providerId,
            metadata: user.metadata
          });
          
          // You could sync this with Firestore if needed
          // For now, we're just using Firebase Authentication
        } catch (error) {
          console.error("Error processing authenticated user:", error);
        }
      } else {
        console.log("No user is signed in with Firebase");
      }
      
      setIsLoading(false);
    });

    // Check for redirect result when component mounts
    const checkRedirectResult = async () => {
      console.log("Checking for Google redirect result...");
      try {
        const result = await getGoogleRedirectResult();
        if (result) {
          // User successfully signed in after redirect
          console.log("Google redirect sign-in successful:", result.user.email);
          toast({
            title: "Success",
            description: "You've successfully signed in with Google.",
          });
        } else {
          console.log("No redirect result found");
        }
      } catch (error: any) {
        console.error("Google redirect error:", error);
        
        // Only show toast for real errors, not just absence of redirect
        if (error.code && error.code !== 'auth/no-auth-event') {
          toast({
            title: "Google Sign-In Error",
            description: getReadableAuthError(error.code),
            variant: "destructive",
          });
        }
      }
    };
    
    checkRedirectResult();

    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Login attempt with email:", email);
      await loginWithEmailPassword(email, password);
      console.log("Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle invalid API key error differently since it's likely a configuration issue
      if (error.code && error.code.includes("api-key-not-valid")) {
        console.error("Firebase API key is not valid. Check the Firebase configuration.");
        
        // Get detailed error info
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        toast({
          title: "Firebase Configuration Error",
          description: "The Firebase API key is invalid. Please check the configuration and try again.",
          variant: "destructive",
        });
      } else {
        // Get a user-friendly error message
        const errorMessage = getReadableAuthError(error.code);
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Registration attempt with email:", email);
      await registerWithEmailPassword(email, password);
      console.log("Registration successful");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle invalid API key error differently since it's likely a configuration issue
      if (error.code && error.code.includes("api-key-not-valid")) {
        console.error("Firebase API key is not valid. Check the Firebase configuration.");
        
        // Get detailed error info
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        toast({
          title: "Firebase Configuration Error",
          description: "The Firebase API key is invalid. Please check the configuration and try again.",
          variant: "destructive",
        });
      } else {
        // Get a user-friendly error message
        const errorMessage = getReadableAuthError(error.code);
        
        toast({
          title: "Registration Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<UserCredential | void> => {
    setIsLoading(true);
    try {
      console.log("Starting Google login redirect flow...");
      
      // Just start the redirect flow - won't actually return anything
      await firebaseLoginWithGoogle();
      
      // This code won't execute due to redirect
      console.log("This line won't run because of redirect");
      return undefined;
    } catch (error: any) {
      console.error("Google login error:", error);
      
      // Handle invalid API key error differently since it's likely a configuration issue
      if (error.code && error.code.includes("api-key-not-valid")) {
        console.error("Firebase API key is not valid. Check the Firebase configuration.");
        
        // Get detailed error info
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        toast({
          title: "Firebase Configuration Error",
          description: "The Firebase API key is invalid or Firebase is not properly configured.",
          variant: "destructive",
        });
      } else {
        // Get a user-friendly error message
        const errorMessage = getReadableAuthError(error.code);
        
        toast({
          title: "Google Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Starting logout process...");
      
      // Logout from Firebase
      await logoutUser();
      console.log("Firebase logout successful");
      
      // Clear the current user state (should happen automatically via auth state listener)
      // but we'll do it explicitly too
      setCurrentUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Attempting to change password");
      
      if (!currentUser) {
        throw new Error("No user is currently logged in");
      }
      
      const result = await changeUserPassword(currentUser, currentPassword, newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      
      return result;
    } catch (error: any) {
      console.error("Change password error:", error);
      
      // Get a user-friendly error message
      let errorMessage = "Failed to update password. Please try again.";
      
      if (error.code) {
        if (error.code === "auth/wrong-password") {
          errorMessage = "Current password is incorrect.";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "New password is too weak. Choose a stronger password.";
        } else if (error.code === "auth/requires-recent-login") {
          errorMessage = "This operation is sensitive and requires recent authentication. Please log in again before retrying.";
        } else {
          errorMessage = getReadableAuthError(error.code);
        }
      }
      
      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    login,
    register,
    loginWithGoogle: handleGoogleLogin,
    logout,
    changePassword: handleChangePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
