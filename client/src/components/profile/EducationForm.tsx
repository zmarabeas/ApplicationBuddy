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
const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional().default(false),
  description: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

export default function EducationForm() {
  const { profileData, addEducation, updateEducation, deleteEducation } = useProfile();
  const [editMode, setEditMode] = useState<{ id: number } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const educations = profileData?.educations || [];

  // Default values for new education
  const defaultValues: EducationFormValues = {
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues,
  });

  const handleEdit = (edu: any) => {
    setEditMode({ id: edu.id });
    form.reset({
      institution: edu.institution,
      degree: edu.degree || "",
      field: edu.field || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      current: edu.current || false,
      description: edu.description || "",
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
      await deleteEducation(id);
      setEditMode(null);
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  const onSubmit = async (values: EducationFormValues) => {
    try {
      setIsSaving(true);
      
      if (editMode) {
        await updateEducation(editMode.id, values);
      } else {
        await addEducation(values);
      }
      
      setEditMode(null);
      setIsAddingNew(false);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-foreground">Education</h3>
        {!isAddingNew && !editMode && (
          <Button
            onClick={handleAddNew}
            variant="outline"
            className="inline-flex items-center px-3 py-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      {/* List of existing educations */}
      {!isAddingNew && !editMode && educations.length > 0 && (
        <div className="space-y-4">
          {educations.map((edu) => (
            <Card key={edu.id} className="shadow-sm hover:shadow transition-shadow border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{edu.institution}</h4>
                      <CopyButton 
                        value={edu.institution}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    
                    {edu.degree && edu.field && (
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          {edu.degree} in {edu.field}
                        </p>
                        <CopyButton 
                          value={`${edu.degree} in ${edu.field}`}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    {edu.degree && !edu.field && (
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                        <CopyButton 
                          value={edu.degree}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    {!edu.degree && edu.field && (
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">{edu.field}</p>
                        <CopyButton 
                          value={edu.field}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate)}
                    </p>
                    
                    {edu.description && (
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-muted-foreground pr-2">{edu.description}</p>
                          <CopyButton 
                            value={edu.description}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 shrink-0 mt-0.5"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-border">
                      <CopyButton 
                        value={`${edu.institution}${edu.degree && edu.field ? ` - ${edu.degree} in ${edu.field}` : edu.degree ? ` - ${edu.degree}` : edu.field ? ` - ${edu.field}` : ''}, ${formatDate(edu.startDate)} - ${edu.current ? "Present" : formatDate(edu.endDate)}${edu.description ? `\n\n${edu.description}` : ''}`}
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
                      onClick={() => handleEdit(edu)}
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
                          <AlertDialogTitle>Delete Education</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this education entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(edu.id)}
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
                {editMode ? "Edit Education" : "Add Education"}
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
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="University or institution name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Degree</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bachelor's, Master's, PhD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="field"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science, Business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                          I am currently studying here
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
                          placeholder="Describe your studies, achievements, or relevant coursework..."
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
      {!isAddingNew && !editMode && educations.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You haven't added any education yet.</p>
            <Button onClick={handleAddNew} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
