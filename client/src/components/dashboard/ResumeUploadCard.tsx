import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { parseResume, ParsedResume, uploadAndParseResume } from "@/lib/resumeParser";
import { useProfile } from "@/contexts/ProfileContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Check, AlertCircle } from "lucide-react";

export default function ResumeUploadCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updatePersonalInfo, addWorkExperience, addEducation, updateSkills } = useProfile();

  const uploadResumeMutation = useMutation({
    mutationFn: async (data: { 
      filename: string, 
      fileType: string, 
      parsedData: ParsedResume 
    }) => {
      return apiRequest("POST", "/api/resume/process", data);
    },
    onSuccess: () => {
      setUploadSuccess(true);
      setIsProcessing(false);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been processed successfully.",
      });
    },
    onError: (error) => {
      console.error("Resume upload error:", error);
      setErrorMessage("Failed to upload resume.");
      setIsProcessing(false);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your resume.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      setErrorMessage("Please upload a PDF or DOCX file.");
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit.");
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      // Use uploadAndParseResume which sends the file directly to the server
      // The server will handle all parsing and database updates
      const result = await uploadAndParseResume(file);
      
      // Let the user know about success
      setUploadSuccess(true);
      setIsProcessing(false);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been processed and your profile has been updated.",
      });
      
    } catch (error) {
      console.error("Resume parsing error:", error);
      setErrorMessage("Failed to upload and parse resume.");
      setIsProcessing(false);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was a problem processing your resume.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mt-6 bg-card border border-border code-glow">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-foreground">
          <span className="neon-text">&lt;</span>
          Upload Your Resume
          <span className="neon-text">/&gt;</span>
        </h3>
        <div className="mt-2 max-w-xl text-sm text-muted-foreground">
          <p>Upload your resume to automatically fill your profile information. We support PDF and DOCX formats.</p>
        </div>
        <div className="mt-5">
          <div 
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
              isDragging ? 'border-primary' : 'border-border'
            } ${
              isDragging ? 'bg-primary/10' : 'bg-card'
            } border-dashed rounded-md cursor-pointer transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <div className="space-y-1 text-center">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processing your resume...</p>
                </div>
              ) : uploadSuccess ? (
                <div className="flex flex-col items-center">
                  <Check className="mx-auto h-12 w-12 text-primary" />
                  <p className="text-sm text-foreground mt-2">Resume uploaded successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1">Your profile has been updated.</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-foreground">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer font-medium text-primary hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF or DOCX up to 10MB</p>
                  
                  {errorMessage && (
                    <div className="flex items-center mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{errorMessage}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
