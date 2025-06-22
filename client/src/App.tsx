import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Resume from "@/pages/resume";
import Templates from "@/pages/templates";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Status from "@/pages/status";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { currentUser, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  return <Component />;
}

function PublicPage({ component: Component }: { component: React.ComponentType }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Landing page - accessible to all users */}
      <Route path="/">
        {() => <PublicPage component={LandingPage} />}
      </Route>
      
      {/* Auth routes - redirect to dashboard if authenticated */}
      <Route path="/login">
        {() => <PublicRoute component={Login} />}
      </Route>
      <Route path="/register">
        {() => <PublicRoute component={Register} />}
      </Route>
      
      {/* Public pages - accessible to all users */}
      <Route path="/privacy">
        {() => <PublicPage component={Privacy} />}
      </Route>
      <Route path="/terms">
        {() => <PublicPage component={Terms} />}
      </Route>
      <Route path="/help">
        {() => <PublicPage component={Help} />}
      </Route>
      <Route path="/status">
        {() => <PublicPage component={Status} />}
      </Route>
      
      {/* Protected routes - require authentication */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/resume">
        {() => <ProtectedRoute component={Resume} />}
      </Route>
      <Route path="/templates">
        {() => <ProtectedRoute component={Templates} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
