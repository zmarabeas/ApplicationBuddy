import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Profile types
interface PersonalInfo {
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

interface WorkExperience {
  id?: number;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Education {
  id?: number;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Profile {
  id: number;
  personalInfo: PersonalInfo | null;
  skills: string[] | null;
  completionPercentage: number;
}

interface ProfileData {
  profile: Profile;
  workExperiences: WorkExperience[];
  educations: Education[];
}

interface ProfileContextType {
  profileData: ProfileData | null;
  isLoading: boolean;
  error: unknown;
  updatePersonalInfo: (personalInfo: PersonalInfo) => Promise<void>;
  addWorkExperience: (workExp: WorkExperience) => Promise<void>;
  updateWorkExperience: (id: number, workExp: WorkExperience) => Promise<void>;
  deleteWorkExperience: (id: number) => Promise<void>;
  addEducation: (education: Education) => Promise<void>;
  updateEducation: (id: number, education: Education) => Promise<void>;
  deleteEducation: (id: number) => Promise<void>;
  updateSkills: (skills: string[]) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch profile data
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!currentUser,
  });

  // Mutations
  const updatePersonalInfoMutation = useMutation({
    mutationFn: async (personalInfo: PersonalInfo) => {
      console.log("Updating personal info:", personalInfo);
      await apiRequest("PATCH", "/api/profile/personal-info", personalInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Personal information updated",
      });
    },
    onError: (error) => {
      console.error("Error updating personal info:", error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    },
  });

  const addWorkExperienceMutation = useMutation({
    mutationFn: async (workExp: WorkExperience) => {
      await apiRequest("POST", "/api/profile/work-experiences", workExp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Work experience added",
      });
    },
    onError: (error) => {
      console.error("Error adding work experience:", error);
      toast({
        title: "Error",
        description: "Failed to add work experience",
        variant: "destructive",
      });
    },
  });

  const updateWorkExperienceMutation = useMutation({
    mutationFn: async ({ id, workExp }: { id: number; workExp: WorkExperience }) => {
      await apiRequest("PATCH", `/api/profile/work-experiences/${id}`, workExp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Work experience updated",
      });
    },
    onError: (error) => {
      console.error("Error updating work experience:", error);
      toast({
        title: "Error",
        description: "Failed to update work experience",
        variant: "destructive",
      });
    },
  });

  const deleteWorkExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profile/work-experiences/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Work experience deleted",
      });
    },
    onError: (error) => {
      console.error("Error deleting work experience:", error);
      toast({
        title: "Error",
        description: "Failed to delete work experience",
        variant: "destructive",
      });
    },
  });

  const addEducationMutation = useMutation({
    mutationFn: async (education: Education) => {
      await apiRequest("POST", "/api/profile/educations", education);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Education added",
      });
    },
    onError: (error) => {
      console.error("Error adding education:", error);
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive",
      });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, education }: { id: number; education: Education }) => {
      await apiRequest("PATCH", `/api/profile/educations/${id}`, education);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Education updated",
      });
    },
    onError: (error) => {
      console.error("Error updating education:", error);
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive",
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profile/educations/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Education deleted",
      });
    },
    onError: (error) => {
      console.error("Error deleting education:", error);
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const updateSkillsMutation = useMutation({
    mutationFn: async (skills: string[]) => {
      await apiRequest("PATCH", "/api/profile/skills", { skills });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Skills updated",
      });
    },
    onError: (error) => {
      console.error("Error updating skills:", error);
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive",
      });
    },
  });

  // Handler functions - simplified to only use the server API
  // Server will handle both PostgreSQL and Firebase updates
  const updatePersonalInfo = async (personalInfo: PersonalInfo) => {
    await updatePersonalInfoMutation.mutateAsync(personalInfo);
  };

  const addWorkExperience = async (workExp: WorkExperience) => {
    await addWorkExperienceMutation.mutateAsync(workExp);
  };

  const updateWorkExperience = async (id: number, workExp: WorkExperience) => {
    await updateWorkExperienceMutation.mutateAsync({ id, workExp });
  };

  const deleteWorkExperience = async (id: number) => {
    await deleteWorkExperienceMutation.mutateAsync(id);
  };

  const addEducation = async (education: Education) => {
    await addEducationMutation.mutateAsync(education);
  };

  const updateEducation = async (id: number, education: Education) => {
    await updateEducationMutation.mutateAsync({ id, education });
  };

  const deleteEducation = async (id: number) => {
    await deleteEducationMutation.mutateAsync(id);
  };

  const updateSkills = async (skills: string[]) => {
    await updateSkillsMutation.mutateAsync(skills);
  };

  const value: ProfileContextType = {
    profileData: profileData || null,
    isLoading: isProfileLoading,
    error: profileError,
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    updateSkills
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}