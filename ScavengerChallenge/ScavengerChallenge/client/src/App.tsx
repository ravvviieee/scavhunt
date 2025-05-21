import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WelcomePage from "@/pages/welcome";
import LoginRegisterPage from "@/pages/auth/login-register";
import AdminSubmissionsPage from "@/pages/admin/submissions";
import { HuntProvider } from "./contexts/hunt-context";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { useEffect } from "react";

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Component /> : null;
}

// Admin route component
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation('/login');
      } else if (!user.isAdmin) {
        setLocation('/');
      }
    }
  }, [user, loading, setLocation]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user && user.isAdmin ? <Component /> : null;
}

// Import the My Submissions page
import MySubmissionsPage from "@/pages/my-submissions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/login" component={LoginRegisterPage} />
      <Route path="/hunt" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/my-submissions" component={() => <ProtectedRoute component={MySubmissionsPage} />} />
      <Route path="/admin/submissions" component={() => <AdminRoute component={AdminSubmissionsPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HuntProvider>
          <AppContent />
        </HuntProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
