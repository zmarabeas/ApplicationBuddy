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
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your account settings and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Your email address is used for login and communications.
                </p>
              </div>
            </div>

            <Separator />

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
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
                <Label htmlFor="new-password" className="text-foreground">New Password</Label>
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
                <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
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
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Control how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account and applications
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Auto-fill Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when forms are automatically filled
                </p>
              </div>
              <Switch
                checked={autoFillNotifications}
                onCheckedChange={setAutoFillNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Export your data or reset your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your profile data and application history
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Reset Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Clear all your profile data and start fresh
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setResetDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Irreversible actions that will affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Reset Profile Dialog */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Reset Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This action will permanently delete all your profile data, including work experience, 
                education, skills, and personal information. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleProfileReset}
                disabled={isResettingProfile}
              >
                {isResettingProfile ? "Resetting..." : "Reset Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
