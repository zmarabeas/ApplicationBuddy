import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadResume, getResumes, deleteResume } from "@/lib/resumeUploader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, Trash, Loader2 } from "lucide-react";
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

interface Resume {
  id: number;
  filename: string;
  fileType: string;
  uploadedAt: string;
}

export default function ResumePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch resumes using the independent getResumes function
  const { 
    data: resumes = [], 
    isLoading: isLoadingResumes,
    refetch: refetchResumes
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
  });

  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: () => {
      setIsUploading(false);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been processed and your profile has been updated.",
      });
      refetchResumes();
    },
    onError: (error: Error) => {
      console.error("Resume upload error:", error);
      setUploadError("Failed to upload resume.");
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your resume.",
        variant: "destructive",
      });
    }
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted successfully.",
      });
      refetchResumes();
    },
    onError: (error) => {
      console.error("Resume delete error:", error);
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting your resume.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      setUploadError("Please upload a PDF or DOCX file.");
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Use the mutation to upload the resume
      await uploadResumeMutation.mutateAsync(file);
      
      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      // The error is handled in the mutation's onError
      console.error("Resume upload caught error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteResumeMutation.mutateAsync(id);
  };

  return (
    <PageLayout title="Resume Management">
      <div className="mt-6 space-y-6">
        {/* Upload Card */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-4">
              <FileText className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Upload Your Resume</h2>
              <p className="text-center text-muted-foreground mb-6 max-w-md">
                Upload your resume to automatically fill your profile information.
                We support PDF and DOCX formats up to 10MB.
              </p>
              
              <label htmlFor="resume-upload">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button 
                  variant="default" 
                  className="flex items-center gap-2"
                  disabled={isUploading}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Resume</span>
                    </>
                  )}
                </Button>
              </label>
              
              {uploadError && (
                <div className="mt-4 flex items-center text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumes List */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Your Resumes</h2>
            
            {isLoadingResumes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-4 border border-border rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-primary mr-3" />
                      <div>
                        <p className="font-medium text-foreground">{resume.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this resume? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(resume.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-border rounded-md">
                <p className="text-muted-foreground mb-2">You haven't uploaded any resumes yet.</p>
                <p className="text-muted-foreground text-sm">Upload a resume to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
