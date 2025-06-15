import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function UserInfo() {
  const { currentUser, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.displayName || currentUser.email || "User";
  const email = currentUser.email || "";
  const photoURL = currentUser.photoURL || "";
  const initials = getInitials(displayName);

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Avatar>
          <AvatarImage src={photoURL} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-foreground">{displayName}</p>
        <p className="text-xs font-medium text-muted-foreground">{email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="p-1 ml-auto rounded-full text-muted-foreground hover:text-primary"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span className="sr-only">Log out</span>
      </Button>
    </div>
  );
}
