import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Download } from "lucide-react";
import ExtensionDemoModal from "@/components/dashboard/ExtensionDemoModal";

export default function ExtensionCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="mt-6 bg-card border border-border code-glow">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary/20 border border-primary/40 rounded-md p-3">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg leading-6 font-medium text-foreground">
                <span className="neon-text">&lt;</span>
                Browser Extension
                <span className="neon-text">/&gt;</span>
              </h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Install our browser extension to automatically fill job applications with your profile data.</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50"
            >
              <Download className="-ml-1 mr-2 h-5 w-5" />
              Install Extension
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ExtensionDemoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
