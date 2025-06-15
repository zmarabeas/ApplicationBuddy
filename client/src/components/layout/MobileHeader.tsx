import { useState } from "react";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, CheckCircle, LayoutDashboard, User, FileText, Settings, HelpCircle, Lock, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import UserInfo from "@/components/layout/UserInfo";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
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

  const handleNavigation = (href: string) => {
    setOpen(false);
  };

  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center bg-card border-b border-border px-4 h-16 code-glow">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="mr-2 px-0 hover:bg-transparent text-foreground">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-card border-r border-border">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Job<span className="neon-text">Fillr</span></span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <div key={item.href} className="relative">
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md group transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-foreground hover:bg-card hover:text-primary"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 mr-3",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {item.name}
                    </a>
                  </div>
                );
              })}
            </nav>

            {/* User info */}
            {currentUser && (
              <div className="flex-shrink-0 p-4 border-t border-border">
                <UserInfo />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex justify-center flex-1">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Job<span className="neon-text">Fillr</span></span>
        </div>
      </div>
    </div>
  );
}
