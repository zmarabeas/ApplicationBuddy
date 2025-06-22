import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UserInfo from "@/components/layout/UserInfo";
import AnimatedIcon from "@/components/ui/animated-icon";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  HelpCircle,
  CheckCircle,
  Lock,
  FileQuestion
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Resume",
      href: "/resume",
      icon: FileText,
    },
    {
      name: "Templates",
      href: "/templates",
      icon: FileQuestion,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Help",
      href: "/help",
      icon: HelpCircle,
    },
    {
      name: "Privacy",
      href: "/privacy",
      icon: Lock,
    },
  ];

  return (
    <div className={cn("hidden md:flex md:flex-shrink-0", className)}>
      <div className="flex flex-col w-64 bg-card border-r border-border code-glow">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <AnimatedIcon size={24} />
            <span className="text-xl font-bold text-foreground">Job<span className="neon-text">Fillr</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <div key={item.href} className="relative">
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md group transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-foreground hover:bg-card hover:text-primary"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 mr-3",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="flex-shrink-0 p-4 border-t border-border">
            <UserInfo />
          </div>
        )}
      </div>
    </div>
  );
}
