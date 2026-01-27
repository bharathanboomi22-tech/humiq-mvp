import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CompanyOnboardingLayout,
  ModeShiftStep,
  CompanyContextStep,
  RoleIntentStep,
  TeamContextStep,
  AIIntelligenceStep,
  InterviewsRunningStep,
  DecisionSurfaceStep,
} from '@/components/company-onboarding';
import { analyzeCompany, setStoredCompanyId } from '@/lib/company';
import { useAuth } from '@/hooks/useAuth';

type Step = 
  | 'mode-shift'
  | 'company-context'
  | 'role-intent'
  | 'team-context'
  | 'ai-intelligence'
  | 'interviews-running'
  | 'decision-surface';

const STEP_ORDER: Step[] = [
  'mode-shift',
  'company-context',
  'role-intent',
  'team-context',
  'ai-intelligence',
  'interviews-running',
  'decision-surface',
];

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const { setCompanyId } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>('mode-shift');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingIntelligence, setIsGeneratingIntelligence] = useState(false);

  // Form data
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [roleData, setRoleData] = useState({
    roleName: '',
    primaryOutcome: '',
    decisions: [] as string[],
    problemDomain: '',
    urgency: '',
    workMode: '',
  });
  const [teamData, setTeamData] = useState({
    optimizesFor: '',
    decisionStyle: '',
    pressurePoint: '',
    ninetyDaySuccess: '',
  });

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEP_ORDER[prevIndex]);
    }
  };

  const handleCompanyContextContinue = async () => {
    setIsAnalyzing(true);
    try {
      const company = await analyzeCompany({
        name: companyName.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      
      setStoredCompanyId(company.id);
      setCompanyId(company.id);
      
      goToStep('role-intent');
    } catch (error) {
      console.error('Error analyzing company:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze company');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTeamContextContinue = async () => {
    setIsGeneratingIntelligence(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGeneratingIntelligence(false);
    goToStep('ai-intelligence');
  };

  const handleRunInterviews = () => {
    goToStep('interviews-running');
  };

  const handleInterviewsComplete = useCallback(() => {
    goToStep('decision-surface');
  }, []);

  const handleComplete = () => {
    toast.success('Hiring intent configured successfully!');
    navigate('/company/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'mode-shift':
        return (
          <ModeShiftStep
            onContinue={() => goToStep('company-context')}
          />
        );

      case 'company-context':
        return (
          <CompanyContextStep
            companyName={companyName}
            setCompanyName={setCompanyName}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            isAnalyzing={isAnalyzing}
            onContinue={handleCompanyContextContinue}
          />
        );

      case 'role-intent':
        return (
          <RoleIntentStep
            roleData={roleData}
            setRoleData={setRoleData}
            onContinue={() => goToStep('team-context')}
          />
        );

      case 'team-context':
        return (
          <TeamContextStep
            teamData={teamData}
            setTeamData={setTeamData}
            isLoading={isGeneratingIntelligence}
            onContinue={handleTeamContextContinue}
          />
        );

      case 'ai-intelligence':
        return (
          <AIIntelligenceStep
            roleData={roleData}
            teamData={teamData}
            onRunInterviews={handleRunInterviews}
          />
        );

      case 'interviews-running':
        return (
          <InterviewsRunningStep
            roleName={roleData.roleName || 'Your Role'}
            onComplete={handleInterviewsComplete}
          />
        );

      case 'decision-surface':
        return (
          <DecisionSurfaceStep
            onComplete={handleComplete}
          />
        );

      default:
        return null;
    }
  };

  // Determine if we should show progress based on step
  const showProgress = !['mode-shift', 'interviews-running', 'decision-surface'].includes(currentStep);

  return (
    <CompanyOnboardingLayout
      currentStep={stepIndex}
      totalSteps={STEP_ORDER.length}
      onBack={stepIndex > 0 && !['mode-shift', 'interviews-running', 'decision-surface'].includes(currentStep) ? goBack : undefined}
      showBack={stepIndex > 0 && !['mode-shift', 'interviews-running', 'decision-surface'].includes(currentStep)}
      showProgress={showProgress}
    >
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </CompanyOnboardingLayout>
  );
};

export default CompanyOnboarding;
