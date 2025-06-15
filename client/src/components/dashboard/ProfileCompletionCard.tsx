import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useState } from "react";
import ProfileModal from "@/components/profile/ProfileModal";

export default function ProfileCompletionCard() {
  const { profileData } = useProfile();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  if (!profileData) {
    return (
      <Card className="bg-card border border-border code-glow">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading profile information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { profile, workExperiences, educations } = profileData;
  const completionPercentage = profile.completionPercentage || 0;

  const profileSections = [
    {
      name: "Personal Information",
      isComplete: !!profile.personalInfo,
    },
    {
      name: "Work Experience",
      isComplete: workExperiences && workExperiences.length > 0,
    },
    {
      name: "Education",
      isComplete: educations && educations.length > 0,
    },
    {
      name: "Skills",
      isComplete: profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
    },
  ];

  return (
    <>
      <Card className="bg-card border border-border code-glow">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              <span className="neon-text">&lt;</span>
              Profile Completion
              <span className="neon-text">/&gt;</span>
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              {completionPercentage}%
            </span>
          </div>
          <div className="mt-4">
            <div className="bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profileSections.map((section) => (
              <div key={section.name} className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                  {section.isComplete ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <p className="ml-2 text-sm text-foreground">{section.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Button 
              onClick={() => setProfileModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50"
            >
              Complete Your Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </>
  );
}
