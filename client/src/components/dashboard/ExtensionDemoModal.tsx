import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, CheckCircle } from "lucide-react";

interface ExtensionDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExtensionDemoModal({ open, onOpenChange }: ExtensionDemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 border border-primary/40 sm:mx-0 sm:h-10 sm:w-10">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle className="text-foreground">
                <span className="neon-text">&lt;</span>
                JobFillr Extension Demo
                <span className="neon-text">/&gt;</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This is how our extension works with job application forms.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 border border-border rounded-md p-4 bg-card/50">
          <div className="space-y-4">
            {/* Form demo */}
            <div className="bg-background border border-border rounded-md p-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Example Job Application Form</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="first-name" className="block text-xs font-medium text-foreground/80">
                      First name
                    </label>
                    <div className="mt-1 relative rounded-md">
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        defaultValue="Alex"
                        className="bg-muted shadow-sm focus:border-primary block w-full sm:text-sm border-border rounded-md border p-2 text-foreground"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="last-name" className="block text-xs font-medium text-foreground/80">
                      Last name
                    </label>
                    <div className="mt-1 relative rounded-md">
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        defaultValue="Johnson"
                        className="bg-muted shadow-sm focus:border-primary block w-full sm:text-sm border-border rounded-md border p-2 text-foreground"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-foreground/80">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue="alex@example.com"
                      className="bg-muted shadow-sm focus:border-primary block w-full sm:text-sm border-border rounded-md border p-2 text-foreground"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-foreground/80">
                    Phone
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      defaultValue="(555) 123-4567"
                      className="bg-muted shadow-sm focus:border-primary block w-full sm:text-sm border-border rounded-md border p-2 text-foreground"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="current-company" className="block text-xs font-medium text-foreground/80">
                    Current company
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <input
                      type="text"
                      name="current-company"
                      id="current-company"
                      defaultValue="Acme Inc."
                      className="bg-muted shadow-sm focus:border-primary block w-full sm:text-sm border-border rounded-md border p-2 text-foreground"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extension controls */}
            <div className="bg-primary/10 border border-primary/30 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-foreground">JobFillr Extension</h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                  Fields Detected: 5
                </span>
              </div>
              <Button className="w-full flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50">
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h12a1 1 0 100-2H4zm0 4a1 1 0 100 2h12a1 1 0 100-2H4zm0 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                </svg>
                Auto-Fill All Fields
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground hover:bg-primary/10 hover:text-primary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
