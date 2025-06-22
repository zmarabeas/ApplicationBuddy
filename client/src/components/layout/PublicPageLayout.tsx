import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedIcon from "@/components/ui/animated-icon";
import { LogOut } from "lucide-react";

interface PublicPageLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PublicPageLayout({ children, title }: PublicPageLayoutProps) {
  const [, navigate] = useLocation();
  const { currentUser, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <AnimatedIcon size={20} />
              </div>
              <h1 
                className="text-xl font-bold text-foreground cursor-pointer"
                onClick={() => navigate('/')}
              >
                ApplicationBuddy
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {title}
              </h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
} 