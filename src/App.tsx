
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import ApplicantsPage from "./pages/ApplicantsPage";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Security from "./pages/Security";
import Resumes from "./pages/Resumes";
import { AuthProvider } from "@/components/AuthContext";
import { AnalyticsProvider } from "@/components/AnalyticsContext";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import AuthDemo from "./components/AuthDemo";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Auth />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <NotFound />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/applicant-dashboard" element={
                <ProtectedRoute allowedRoles={['applicant']}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/company-dashboard" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/applicants" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <ApplicantsPage />
                </ProtectedRoute>
              } />
              <Route path="/help" element={<Help />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/team" element={<Team />} />
              <Route path="/security" element={<Security />} />
              <Route path="/resumes" element={<Resumes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;
