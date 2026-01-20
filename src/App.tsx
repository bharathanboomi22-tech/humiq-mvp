import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, CompanyRoute, TalentRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WorkSessionStart from "./pages/WorkSessionStart";
import WorkSessionLive from "./pages/WorkSessionLive";
import EvidencePack from "./pages/EvidencePack";
// Company pages
import CompanySetup from "./pages/CompanySetup";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyJobNew from "./pages/CompanyJobNew";
import CompanyJobEdit from "./pages/CompanyJobEdit";
import CompanyMatches from "./pages/CompanyMatches";
import CompanyTalentDetail from "./pages/CompanyTalentDetail";
// Talent pages
import TalentOnboarding from "./pages/TalentOnboarding";
import TalentDashboard from "./pages/TalentDashboard";
import TalentJobDetail from "./pages/TalentJobDetail";
import InterviewResult from "./pages/InterviewResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            
            {/* Work Session */}
            <Route path="/work-session/start" element={
              <ProtectedRoute>
                <WorkSessionStart />
              </ProtectedRoute>
            } />
            <Route path="/work-session/live/:sessionId" element={
              <ProtectedRoute>
                <WorkSessionLive />
              </ProtectedRoute>
            } />
            <Route path="/evidence-pack/:sessionId" element={
              <ProtectedRoute>
                <EvidencePack />
              </ProtectedRoute>
            } />
            
            {/* Company Routes */}
            <Route path="/company/setup" element={
              <CompanyRoute>
                <CompanySetup />
              </CompanyRoute>
            } />
            <Route path="/company/dashboard" element={
              <CompanyRoute>
                <CompanyDashboard />
              </CompanyRoute>
            } />
            <Route path="/company/jobs/new" element={
              <CompanyRoute>
                <CompanyJobNew />
              </CompanyRoute>
            } />
            <Route path="/company/jobs/:jobId/edit" element={
              <CompanyRoute>
                <CompanyJobEdit />
              </CompanyRoute>
            } />
            <Route path="/company/matches" element={
              <CompanyRoute>
                <CompanyMatches />
              </CompanyRoute>
            } />
            <Route path="/company/talent/:talentId" element={
              <CompanyRoute>
                <CompanyTalentDetail />
              </CompanyRoute>
            } />
            
            {/* Talent Routes */}
            <Route path="/talent/onboarding" element={
              <TalentRoute>
                <TalentOnboarding />
              </TalentRoute>
            } />
            <Route path="/talent/dashboard" element={
              <TalentRoute>
                <TalentDashboard />
              </TalentRoute>
            } />
            <Route path="/talent/job/:jobId" element={
              <TalentRoute>
                <TalentJobDetail />
              </TalentRoute>
            } />
            <Route path="/interview/result/:id" element={
              <TalentRoute>
                <InterviewResult />
              </TalentRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
