import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, FileText, Download, Mail } from "lucide-react";

export default function Help() {
  return (
    <PublicPageLayout title="Help & Support">
      <div className="mt-6 space-y-6 max-w-3xl">
        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-primary-50 border-primary-100">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <HelpCircle className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">FAQ</h3>
              <p className="text-sm text-gray-600 mb-4">Find answers to common questions</p>
              <Button variant="outline" className="w-full">View FAQs</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-50 border-primary-100">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">Read detailed guides and tutorials</p>
              <Button variant="outline" className="w-full">View Docs</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-50 border-primary-100">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Contact Support</h3>
              <p className="text-sm text-gray-600 mb-4">Get help from our support team</p>
              <Button variant="outline" className="w-full">Contact Us</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to commonly asked questions about ApplicationBuddy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does ApplicationBuddy detect form fields?</AccordionTrigger>
                <AccordionContent>
                  ApplicationBuddy uses advanced algorithms to analyze web pages and identify form fields based on various attributes like field names, labels, placeholders, and context. The system constantly learns from user interactions to improve accuracy over time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, your data is secure. We use industry-standard encryption for all data transmission and storage. Your profile information is only accessible to you through your secure account, and we never share your personal data with third parties without your explicit consent.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>What file formats are supported for resume uploads?</AccordionTrigger>
                <AccordionContent>
                  ApplicationBuddy currently supports PDF and DOCX file formats for resume uploads. The maximum file size is 10MB. We're working on adding support for additional formats in the future.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How accurate is the auto-fill functionality?</AccordionTrigger>
                <AccordionContent>
                  ApplicationBuddy's auto-fill accuracy depends on several factors, including the complexity of the job application form and how complete your profile is. In general, our system achieves high accuracy for standard fields like personal information, work history, and education. You can always review and correct any fields before submitting applications.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Which browsers are supported?</AccordionTrigger>
                <AccordionContent>
                  Currently, the ApplicationBuddy extension is available for Google Chrome and Brave browsers. We're working on adding support for Firefox, Safari, and other browsers in the near future.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>How do I install the browser extension?</AccordionTrigger>
                <AccordionContent>
                  To install the ApplicationBuddy extension, click on the "Install Extension" button on your dashboard or settings page. This will take you to the Chrome Web Store where you can add the extension to your browser with just one click. After installation, you'll need to log in to the extension using your ApplicationBuddy account credentials.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Extension Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Browser Extension
            </CardTitle>
            <CardDescription>
              Learn how to use the ApplicationBuddy browser extension effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-md font-medium">Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-2">
                <li>Install the extension from the Chrome Web Store</li>
                <li>Log in using your ApplicationBuddy account credentials</li>
                <li>Navigate to any job application form</li>
                <li>Click the ApplicationBuddy icon in your browser toolbar</li>
                <li>Review detected fields and click "Auto-Fill" to populate the form</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-md font-medium">Troubleshooting</h3>
              <p className="text-sm text-gray-600">
                If you're experiencing issues with the extension, try these steps:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-2">
                <li>Make sure your profile is complete in the web portal</li>
                <li>Refresh the page and try again</li>
                <li>Ensure you're logged in to both the extension and web portal</li>
                <li>Disable other form-filling extensions that might conflict</li>
                <li>Update the extension to the latest version</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <Button className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Install Extension
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Our support team is ready to assist you with any questions or issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              If you couldn't find the answer you're looking for, please reach out to our support team. We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="flex-1">
                Live Chat Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  );
}
