
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ApplicantDashboard from "./pages/ApplicantDashboard";
// Lazy load the CompanyDashboard component
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
import ApplicantsPage from "./pages/ApplicantsPage";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Security from "./pages/Security";
import Resumes from "./pages/Resumes";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./components/JobPosting/JobDetail";
import { AuthProvider } from "@/components/AuthContext";
import { AnalyticsProvider } from "@/components/AnalyticsContext";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

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

// Loading component for lazy loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner className="w-12 h-12" />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/applicant-dashboard" element={
                <ProtectedRoute allowedRoles={['applicant']}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              } />
              <Route 
                path="/company-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company-dashboard/:section?" 
                element={
                  <ProtectedRoute allowedRoles={['company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                } 
              />
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
              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </QueryClientProvider>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;
