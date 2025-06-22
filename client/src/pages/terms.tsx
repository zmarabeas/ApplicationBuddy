import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <PublicPageLayout title="Terms of Service">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
              
              <p className="text-muted-foreground mb-6">
                <strong>Last updated:</strong> January 24, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using ApplicationBuddy ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  ApplicationBuddy is a job application automation platform that provides:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Browser extension for automated form filling</li>
                  <li>Profile management and data storage</li>
                  <li>AI-powered resume parsing and data extraction</li>
                  <li>Application tracking and management tools</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <p className="mb-4">
                  To use certain features of the Service, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                <p className="mb-4">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Submit false or misleading information</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Use the Service for any commercial purpose without authorization</li>
                  <li>Interfere with or disrupt the Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
                <p className="mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <p className="mb-4">
                  We implement appropriate security measures to protect your data, but no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="mb-4">
                  The Service and its original content, features, and functionality are owned by ApplicationBuddy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="mb-4">
                  You retain ownership of any content you submit to the Service, but you grant us a license to use, store, and process that content to provide the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="mb-4">
                  In no event shall ApplicationBuddy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Your use or inability to use the Service</li>
                  <li>Any unauthorized access to or use of our servers</li>
                  <li>Any interruption or cessation of transmission to or from the Service</li>
                  <li>Any bugs, viruses, or other harmful code that may be transmitted</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
                <p className="mb-4">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. ApplicationBuddy makes no warranties, expressed or implied, and hereby disclaims all warranties, including without limitation:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>That the Service will meet your specific requirements</li>
                  <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
                  <li>That the results obtained from using the Service will be accurate or reliable</li>
                  <li>That the quality of any products, services, information, or other material will meet your expectations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p className="mb-4">
                  Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
                <p className="mb-4">
                  These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
                <p className="mb-4">
                  What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="mb-2"><strong>Email:</strong> legal@applicationbuddy.com</p>
                  <p className="mb-2"><strong>Address:</strong> [Your Business Address]</p>
                  <p><strong>Phone:</strong> [Your Phone Number]</p>
                </div>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-muted-foreground">
                  These Terms of Service constitute the entire agreement between you and ApplicationBuddy regarding the use of the Service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  );
} 