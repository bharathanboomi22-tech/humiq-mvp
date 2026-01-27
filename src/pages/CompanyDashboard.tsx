import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getStoredCompanyId, getCompany, getCompanyJobs } from '@/lib/company';
import { getInterviewResultsForCompany, InterviewResultWithTalent } from '@/lib/interviews';
import { Company, JobPosting } from '@/types/company';
import {
  TalentBrief,
  RoleContext,
  DecisionTier,
  TalentTierGroup,
  RoleContextStrip,
  InterviewsInProgressState,
  NoStrongHiresState,
  AskAIPanel,
} from '@/components/company/decision-surface';
import { MOCK_TALENTS, MOCK_ROLE_CONTEXT } from '@/components/company/decision-surface/mockData';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [completedInterviews, setCompletedInterviews] = useState<InterviewResultWithTalent[]>([]);

  // Decision Surface state
  const [talents, setTalents] = useState<TalentBrief[]>(MOCK_TALENTS);
  const [roleContext, setRoleContext] = useState<RoleContext>(MOCK_ROLE_CONTEXT);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [selectedTalentForAI, setSelectedTalentForAI] = useState<TalentBrief | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const storedCompanyId = getStoredCompanyId();

      if (!storedCompanyId) {
        navigate('/company/setup');
        return;
      }

      setCompanyId(storedCompanyId);

      try {
        const [companyData, jobsData, interviewResultsData] = await Promise.all([
          getCompany(storedCompanyId),
          getCompanyJobs(storedCompanyId, true),
          getInterviewResultsForCompany(storedCompanyId),
        ]);

        if (!companyData) {
          toast.error('Company not found');
          navigate('/company/setup');
          return;
        }

        setCompany(companyData);
        setJobs(jobsData);
        setCompletedInterviews(interviewResultsData);

        // If we have active jobs, use the first one for context
        const activeJob = jobsData.find((j) => j.is_active);
        if (activeJob) {
          setRoleContext({
            title: activeJob.title,
            primaryOutcome: activeJob.analyzed_data?.summary?.slice(0, 50) || 'ownership under ambiguity',
            interviewStatus: interviewResultsData.length > 0 ? 'complete' : 'in-progress',
          });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Group talents by tier
  const groupedTalents = {
    strong: talents.filter((t) => t.tier === 'strong'),
    contextual: talents.filter((t) => t.tier === 'contextual'),
    future: talents.filter((t) => t.tier === 'future'),
  };

  const handleInvite = (id: string) => {
    const talent = talents.find((t) => t.id === id);
    toast.success(`Invitation sent to ${talent?.name}`);
  };

  const handleSave = (id: string) => {
    const talent = talents.find((t) => t.id === id);
    toast.success(`${talent?.name} saved for future roles`);
  };

  const handleAskAI = (id: string) => {
    const talent = talents.find((t) => t.id === id);
    setSelectedTalentForAI(talent || null);
    setAskAIOpen(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen blush-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </main>
    );
  }

  if (!company) {
    return null;
  }

  const hasNoTalent = talents.length === 0;
  const isInterviewsInProgress = roleContext.interviewStatus === 'in-progress' && talents.length === 0;

  return (
    <main className="min-h-screen blush-gradient">
      <Navigation variant="company" />
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <header className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex mb-4"
            >
              <div className="w-12 h-12 rounded-full cognitive-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2"
            >
              Decision-ready talent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              These people have already been interviewed and understood by HumiQ.
            </motion.p>
          </header>

          {/* Role Context Strip */}
          {jobs.length > 0 && <RoleContextStrip role={roleContext} />}

          {/* Content */}
          {isInterviewsInProgress ? (
            <InterviewsInProgressState />
          ) : hasNoTalent ? (
            <NoStrongHiresState />
          ) : (
            <div>
              {(['strong', 'contextual', 'future'] as const).map((tier, groupIndex) => (
                <TalentTierGroup
                  key={tier}
                  tier={tier}
                  talents={groupedTalents[tier]}
                  groupIndex={groupIndex}
                  onInvite={handleInvite}
                  onSave={handleSave}
                  onAskAI={handleAskAI}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Ask AI Panel */}
      <AskAIPanel
        talentName={selectedTalentForAI?.name || ''}
        isOpen={askAIOpen}
        onClose={() => {
          setAskAIOpen(false);
          setSelectedTalentForAI(null);
        }}
      />
    </main>
  );
};

export default CompanyDashboard;
