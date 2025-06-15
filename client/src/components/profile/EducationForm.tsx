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
        <h3 className="text-md font-medium text-gray-900">Education</h3>
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
            <Card key={edu.id} className="shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">{edu.institution}</h4>
                      <CopyButton 
                        value={edu.institution}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      />
                    </div>
                    
                    {edu.degree && edu.field && (
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">
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
                        <p className="text-sm text-gray-600">{edu.degree}</p>
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
                        <p className="text-sm text-gray-600">{edu.field}</p>
                        <CopyButton 
                          value={edu.field}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate)}
                    </p>
                    
                    {edu.description && (
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-600 pr-2">{edu.description}</p>
                          <CopyButton 
                            value={edu.description}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 shrink-0 mt-0.5"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <CopyButton 
                        value={`${edu.institution}${(edu.degree || edu.field) ? ` - ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}` : ''}, ${formatDate(edu.startDate)} - ${edu.current ? "Present" : formatDate(edu.endDate)}${edu.description ? `\n\n${edu.description}` : ''}`}
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
                      onClick={() => handleEdit(edu)}
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
                          <AlertDialogTitle>Delete Education</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this education? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(edu.id)}
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
      {!isAddingNew && !editMode && educations.length === 0 && (
        <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 mb-4">You haven't added any education yet.</p>
          <Button onClick={handleAddNew} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        </div>
      )}

      {/* Form for adding/editing education */}
      {(isAddingNew || editMode) && (
        <Card>
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution *</FormLabel>
                      <FormControl>
                        <Input placeholder="University or school name" {...field} />
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
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input placeholder="BS, MS, PhD, etc." {...field} />
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
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science, Business, etc." {...field} />
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
                            <FormLabel>I'm currently studying here</FormLabel>
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
                          placeholder="Additional information about your education"
                          className="min-h-[80px]"
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
