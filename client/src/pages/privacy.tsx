import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Privacy() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { profileData } = useProfile();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Fetch the profile data including all related information
      const response = await apiRequest("GET", "/api/user/export-data");
      
      // Create a JSON blob and download it
      const jsonString = JSON.stringify(response, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobfillr-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      
      await apiRequest("POST", "/api/user/delete-account");
      
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      // Redirect to the login page after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast({
        title: "Deletion Failed",
        description: "There was a problem deleting your account. Please try again or contact support.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <PageLayout title="Privacy Policy">
      <div className="mt-6 space-y-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert">
              <h2>JobFillr Privacy Policy</h2>
              <p>Last Updated: May 1, 2025</p>
              
              <p>
                At JobFillr, we're committed to protecting your privacy and ensuring you have control over your personal data.
                This Privacy Policy explains how we collect, use, and protect your information when you use our service.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Data We Collect</AccordionTrigger>
                  <AccordionContent>
                    <p><strong>Personal Information:</strong> When you register for JobFillr, we collect your email address and name.</p>
                    <p><strong>Profile Information:</strong> Information you provide in your profile, including contact details, work experience, education history, skills, and resume content.</p>
                    <p><strong>Usage Data:</strong> We collect information about how you interact with our service, including forms filled and applications submitted.</p>
                    <p><strong>Device Information:</strong> We collect information about the browser and device you use to access JobFillr.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How We Use Your Data</AccordionTrigger>
                  <AccordionContent>
                    <p><strong>To Provide Our Service:</strong> We use your data to operate and improve JobFillr, including automatically filling job applications.</p>
                    <p><strong>Communication:</strong> We may use your email to send you updates about JobFillr or respond to your inquiries.</p>
                    <p><strong>Service Improvement:</strong> We analyze usage patterns to improve our features and user experience.</p>
                    <p><strong>Legal Compliance:</strong> We may use your data to comply with applicable laws and regulations.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Data Sharing</AccordionTrigger>
                  <AccordionContent>
                    <p><strong>Third-Party Services:</strong> We use Firebase for authentication and data storage. Their privacy policies apply to how they handle your data.</p>
                    <p><strong>With Your Consent:</strong> When you use JobFillr to fill out job applications, your information is shared with the job site you're applying through.</p>
                    <p><strong>Legal Requirements:</strong> We may disclose your information if required by law or to protect rights and safety.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Data Security</AccordionTrigger>
                  <AccordionContent>
                    <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                    <p>All data is transmitted over secure HTTPS connections and stored in encrypted databases.</p>
                    <p>While we strive to protect your personal information, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Your Rights</AccordionTrigger>
                  <AccordionContent>
                    <p>Under GDPR, CCPA, and other privacy regulations, you have the right to:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Delete your data</li>
                      <li>Restrict or object to processing</li>
                      <li>Data portability</li>
                      <li>Withdraw consent</li>
                    </ul>
                    <p className="mt-2">You can exercise these rights using the tools below or by contacting us.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Cookie Policy</AccordionTrigger>
                  <AccordionContent>
                    <p>We use cookies and similar technologies to enhance your experience with JobFillr.</p>
                    <p><strong>Essential Cookies:</strong> Required for the service to function properly, including authentication.</p>
                    <p><strong>Preference Cookies:</strong> Store your preferences and settings.</p>
                    <p><strong>Analytics Cookies:</strong> Help us understand how users interact with our service.</p>
                    <p>You can manage cookie preferences through your browser settings.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Changes to This Policy</AccordionTrigger>
                  <AccordionContent>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                    <p>For significant changes, we will provide a more prominent notice or direct notification.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Contact Us</AccordionTrigger>
                  <AccordionContent>
                    <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                    <p>Email: privacy@jobfillr.com</p>
                    <p>We will respond to your request within 30 days.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Data Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExportData} 
                className="flex items-center gap-2"
                disabled={isExporting}
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export All My Data"}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              <p>
                <strong>Export Data:</strong> Download a copy of all your personal data stored by JobFillr, including profile information, 
                work experiences, education history, skills, and resumes.
              </p>
              <p className="mt-2">
                <strong>Delete Account:</strong> Permanently delete your account and all associated data. This action cannot be undone. 
                We'll delete all your personal information, profiles, and resumes from our servers.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            For more information about our privacy practices, please see our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
