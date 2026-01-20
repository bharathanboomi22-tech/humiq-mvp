import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
// Talent pages
import TalentOnboarding from "./pages/TalentOnboarding";
import TalentDashboard from "./pages/TalentDashboard";
import TalentJobDetail from "./pages/TalentJobDetail";
import InterviewResult from "./pages/InterviewResult";
import CompanyTalentDetail from "./pages/CompanyTalentDetail";
// Auth pages
import AuthLogin from "./pages/AuthLogin";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Work Session */}
          <Route path="/work-session/start" element={<WorkSessionStart />} />
          <Route path="/work-session/live/:sessionId" element={<WorkSessionLive />} />
          <Route path="/evidence-pack/:sessionId" element={<EvidencePack />} />
          {/* Company Routes */}
          <Route path="/company/setup" element={<CompanySetup />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/jobs/new" element={<CompanyJobNew />} />
          <Route path="/company/jobs/:jobId/edit" element={<CompanyJobEdit />} />
          <Route path="/company/matches" element={<CompanyMatches />} />
          {/* Talent Routes */}
          <Route path="/talent/onboarding" element={<TalentOnboarding />} />
          <Route path="/talent/dashboard" element={<TalentDashboard />} />
          <Route path="/talent/job/:jobId" element={<TalentJobDetail />} />
          <Route path="/interview/result/:id" element={<InterviewResult />} />
          {/* Company Detail Routes */}
          <Route path="/company/talent/:talentId" element={<CompanyTalentDetail />} />
          {/* Auth Routes */}
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
