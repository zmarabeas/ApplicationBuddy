import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Copy, ClipboardCopy } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

// Form schema
const skillFormSchema = z.object({
  skill: z.string().min(1, "Skill name is required"),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

export default function SkillsForm() {
  const { profileData, updateSkills } = useProfile();
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const skills = profileData?.profile?.skills || [];

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      skill: "",
    },
  });

  const handleAddSkill = async (values: SkillFormValues) => {
    try {
      setIsSaving(true);
      
      // Add the new skill to the existing skills
      const newSkills = [...skills, values.skill];
      
      // Update skills in the backend
      await updateSkills(newSkills);
      
      // Reset form and state
      form.reset();
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      setIsSaving(true);
      
      // Filter out the skill to remove
      const newSkills = skills.filter((skill) => skill !== skillToRemove);
      
      // Update skills in the backend
      await updateSkills(newSkills);
    } catch (error) {
      console.error("Error removing skill:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-foreground">Skills</h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="inline-flex items-center px-3 py-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </Button>
        )}
      </div>

      {/* Skills list */}
      <div className="space-y-4">
        {skills.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex-1"></div>
              <div className="flex gap-2">
                <CopyButton
                  value={skills.join(", ")}
                  variant="outline"
                  size="sm"
                  displayText={true}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-4">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="py-2 px-3 flex items-center">
                  <span>{skill}</span>
                  <div className="flex items-center ml-2">
                    <CopyButton value={skill} size="icon" variant="ghost" className="h-4 w-4 p-0 mr-1" />
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center p-6 w-full border border-dashed border-border rounded-md">
            <p className="text-muted-foreground mb-4">You haven't added any skills yet.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Skills
            </Button>
          </div>
        )}
      </div>

      {/* Add skill form */}
      {isAdding && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddSkill)} className="space-y-4">
            <FormField
              control={form.control}
              name="skill"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Add a skill (e.g., JavaScript, Project Management)" {...field} />
                    </FormControl>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Adding..." : "Add"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </div>
  );
}
