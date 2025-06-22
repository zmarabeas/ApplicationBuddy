import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Plus, ClipboardCopy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

// Form schema
const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional().default(false),
  description: z.string().optional(),
});

type WorkExperienceFormValues = z.infer<typeof workExperienceSchema>;

export default function WorkExperienceForm() {
  const { profileData, addWorkExperience, updateWorkExperience, deleteWorkExperience } = useProfile();
  const [editMode, setEditMode] = useState<{ id: number } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const workExperiences = profileData?.workExperiences || [];

  // Default values for new experience
  const defaultValues: WorkExperienceFormValues = {
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };

  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues,
  });

  const handleEdit = (exp: any) => {
    setEditMode({ id: exp.id });
    form.reset({
      company: exp.company,
      title: exp.title,
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      current: exp.current || false,
      description: exp.description || "",
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditMode(null);
    setIsAddingNew(true);
    form.reset(defaultValues);
  };

  const handleCancel = () => {
    setEditMode(null);
    setIsAddingNew(false);
    form.reset(defaultValues);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      await deleteWorkExperience(id);
      setEditMode(null);
    } catch (error) {
      console.error("Error deleting work experience:", error);
    }
  };

  const onSubmit = async (values: WorkExperienceFormValues) => {
    try {
      setIsSaving(true);
      
      if (editMode) {
        await updateWorkExperience(editMode.id, values);
      } else {
        await addWorkExperience(values);
      }
      
      setEditMode(null);
      setIsAddingNew(false);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error saving work experience:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-foreground">Work Experience</h3>
        {!isAddingNew && !editMode && (
          <Button
            onClick={handleAddNew}
            variant="outline"
            className="inline-flex items-center px-3 py-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </div>

      {/* List of existing work experiences */}
      {!isAddingNew && !editMode && workExperiences.length > 0 && (
        <div className="space-y-4">
          {workExperiences.map((exp) => (
            <Card key={exp.id} className="shadow-sm hover:shadow transition-shadow border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{exp.title}</h4>
                      <CopyButton 
                        value={exp.title}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <CopyButton 
                        value={exp.company}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    {exp.location && (
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">{exp.location}</p>
                        <CopyButton 
                          value={exp.location}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-muted-foreground pr-2">{exp.description}</p>
                          <CopyButton 
                            value={exp.description}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 shrink-0 mt-0.5"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-border">
                      <CopyButton 
                        value={`${exp.title} at ${exp.company}${exp.location ? ` (${exp.location})` : ''}, ${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}${exp.description ? `\n\n${exp.description}` : ''}`}
                        variant="outline"
                        size="sm"
                        displayText={true}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(exp)}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Edit</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <span className="sr-only">Delete</span>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Work Experience</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this work experience? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(exp.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {(isAddingNew || editMode) && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-foreground">
                {editMode ? "Edit Work Experience" : "Add Work Experience"}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Cancel</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State or Remote" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Start Date</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field} 
                            disabled={form.watch("current")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="current"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-foreground">
                          I currently work here
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your role, responsibilities, and achievements..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : (editMode ? "Update" : "Add")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isAddingNew && !editMode && workExperiences.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You haven't added any work experience yet.</p>
            <Button onClick={handleAddNew} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Work Experience
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
