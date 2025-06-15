import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import ExtensionCard from "@/components/dashboard/ExtensionCard";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, FileText, Clock, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [, setLocation] = useLocation();
  
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "there";
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };
  
  const quickActions = [
    { 
      title: "Profile", 
      icon: <User className="w-5 h-5" />, 
      description: "Update your information",
      action: () => setLocation("/profile")
    },
    { 
      title: "Resume", 
      icon: <FileText className="w-5 h-5" />, 
      description: "Manage your resumes",
      action: () => setLocation("/resume")
    },
    { 
      title: "Applications", 
      icon: <Clock className="w-5 h-5" />, 
      description: "Track job applications",
      action: () => {}
    }
  ];
  
  return (
    <PageLayout title="Dashboard">
      <div className="py-6 px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h2 className="text-xl text-foreground">
            Welcome, <span className="text-primary">{userName}</span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
        >
          <motion.div variants={item}>
            <ProfileCompletionCard />
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="mt-6 bg-card border border-border code-glow">
              <CardContent className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-foreground">
                  <span className="neon-text">&lt;</span>
                  Resume Management
                  <span className="neon-text">/&gt;</span>
                </h3>
                <div className="mt-2 max-w-xl text-sm text-muted-foreground">
                  <p>Upload your resume to automatically fill your profile information. We support PDF and DOCX formats.</p>
                </div>
                <div className="mt-5 flex justify-center">
                  <Link href="/resume">
                    <Button className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4" />
                      <span>Manage Resumes</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <ExtensionCard />
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
