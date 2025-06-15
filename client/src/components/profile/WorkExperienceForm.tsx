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
        <h3 className="text-md font-medium text-gray-900">Work Experience</h3>
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
            <Card key={exp.id} className="shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">{exp.title}</h4>
                      <CopyButton 
                        value={exp.title}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <CopyButton 
                        value={exp.company}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    {exp.location && (
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">{exp.location}</p>
                        <CopyButton 
                          value={exp.location}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-600 pr-2">{exp.description}</p>
                          <CopyButton 
                            value={exp.description}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 shrink-0 mt-0.5"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <CopyButton 
                        value={`${exp.title} at ${exp.company}${exp.location ? ` (${exp.location})` : ''}, ${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}${exp.description ? `\n\n${exp.description}` : ''}`}
                        variant="outline"
                        size="sm"
                        displayText={true}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(exp)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
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
                            className="bg-red-500 hover:bg-red-600 text-white"
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

      {/* Empty state */}
      {!isAddingNew && !editMode && workExperiences.length === 0 && (
        <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 mb-4">You haven't added any work experience yet.</p>
          <Button onClick={handleAddNew} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Work Experience
          </Button>
        </div>
      )}

      {/* Form for adding/editing work experience */}
      {(isAddingNew || editMode) && (
        <Card>
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
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
                        <FormLabel>Job Title *</FormLabel>
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State, Country" {...field} />
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
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormField
                      control={form.control}
                      name="current"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I currently work here</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    {!form.watch("current") && (
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
