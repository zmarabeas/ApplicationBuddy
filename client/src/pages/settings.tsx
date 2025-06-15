import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { getAuth } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Bell, Shield, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Settings() {
  const { currentUser, logout, changePassword } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoFillNotifications, setAutoFillNotifications] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingProfile, setIsResettingProfile] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Clear the form fields after successful password change
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      // Error handling is done in the AuthContext
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle profile reset
  const handleProfileReset = async () => {
    setIsResettingProfile(true);
    
    try {
      // Get the auth instance
      const auth = getAuth();
      
      // Get current user - this is the Firebase User object, not our custom currentUser
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      // Get a fresh token directly from Firebase
      const token = await firebaseUser.getIdToken(true);
      
      console.log("Got Firebase token for reset, length:", token.length);
      
      // Reset profile API call
      const response = await fetch('/api/profile/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Profile Reset Complete",
          description: "Your profile data has been cleared successfully.",
          variant: "default"
        });
        // Force a page reload to reflect changes
        window.location.href = '/profile';
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to reset profile: ${errorText}`);
      }
    } catch (error) {
      console.error('Profile reset error:', error);
      toast({
        title: "Reset Failed",
        description: "There was a problem resetting your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResettingProfile(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <PageLayout title="Settings">
      <div className="mt-6 space-y-6 max-w-3xl">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account settings and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                />
                <p className="text-sm text-gray-500">
                  Your email address is used for login and communications.
                </p>
              </div>
            </div>

            <Separator />

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive important updates and information via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autofill-notifications">
                  Auto-Fill Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Get notified when the extension auto-fills forms
                </p>
              </div>
              <Switch
                id="autofill-notifications"
                checked={autoFillNotifications}
                onCheckedChange={setAutoFillNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Browser Extension */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Browser Extension
            </CardTitle>
            <CardDescription>
              Install and manage the JobFillr browser extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Install Extension</p>
                <p className="text-sm text-gray-500">
                  Auto-fill job applications with your profile data
                </p>
              </div>
              <Button 
                onClick={() => {
                  toast({
                    title: "Extension Demo",
                    description: "This would open the Chrome Web Store in a real app.",
                  });
                }}
              >
                Install Extension
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="text-red-600">
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-500">
              Destructive actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Reset Profile Data</p>
                <p className="text-sm text-gray-500">
                  Delete all your profile data including work experience, education, skills, and resume uploads
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600"
                onClick={() => setResetDialogOpen(true)}
              >
                Reset Profile
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Logout from all devices</p>
                <p className="text-sm text-gray-500">
                  Terminate all active sessions for your account
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-600">
                Logout All
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Log out</p>
                <p className="text-sm text-gray-500">
                  Log out from your current session
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reset Profile Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Reset Profile Data
            </DialogTitle>
            <DialogDescription className="text-red-500/80">
              This action cannot be undone. This will permanently delete all your profile data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-600">Warning</h3>
                  <div className="mt-2 text-sm text-red-600/70">
                    <p>
                      This will permanently delete:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>All work experience entries</li>
                      <li>All education history</li>
                      <li>Your skills list</li>
                      <li>All personal information</li>
                      <li>All uploaded resumes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleProfileReset} 
              disabled={isResettingProfile}
              className="gap-1"
            >
              {isResettingProfile ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Reset Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
