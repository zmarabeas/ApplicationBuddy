import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background grid-pattern">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        {/* Mobile header */}
        <MobileHeader />

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {title && (
              <div className="px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  <span className="neon-text">&lt;</span>
                  {title}
                  <span className="neon-text">/&gt;</span>
                </h1>
              </div>
            )}
            <div className="px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
