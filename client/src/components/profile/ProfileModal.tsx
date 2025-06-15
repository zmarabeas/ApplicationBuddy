import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useState } from "react";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import WorkExperienceForm from "@/components/profile/WorkExperienceForm";
import EducationForm from "@/components/profile/EducationForm";
import SkillsForm from "@/components/profile/SkillsForm";
import { useProfile } from "@/contexts/ProfileContext";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const { profileData } = useProfile();

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogDescription>
                Fill in your profile information to get the most out of JobFillr.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <PersonalInfoForm />
            </TabsContent>
            
            <TabsContent value="experience">
              <WorkExperienceForm />
            </TabsContent>
            
            <TabsContent value="education">
              <EducationForm />
            </TabsContent>
            
            <TabsContent value="skills">
              <SkillsForm />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
