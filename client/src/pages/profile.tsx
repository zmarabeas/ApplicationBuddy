import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import WorkExperienceForm from "@/components/profile/WorkExperienceForm";
import EducationForm from "@/components/profile/EducationForm";
import SkillsForm from "@/components/profile/SkillsForm";
import { useProfile } from "@/contexts/ProfileContext";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const { isLoading } = useProfile();

  if (isLoading) {
    return (
      <PageLayout title="Profile">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile">
      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="experience">Work Experience</TabsTrigger>
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
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
