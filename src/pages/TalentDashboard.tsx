import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Github,
  History,
  Target,
  Briefcase,
  ArrowRight,
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  Server,
  Layout,
  Layers,
  ExternalLink,
  Bell,
  Edit2,
  Save,
  X,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { cn } from '@/lib/utils';
import {
  getStoredTalentId,
  getTalentProfile,
  getTalentEvidencePacks,
  consolidateTalentProfile,
  updateTalentProfile,
  suggestTestsForWeaknesses,
  SuggestedTest,
} from '@/lib/talent';
import { TalentProfile, AVAILABLE_TESTS } from '@/types/talent';
import { InterviewInbox } from '@/components/talent/InterviewInbox';
import { getInterviewResultsForTalent, InterviewResult } from '@/lib/interviews';
import { WorkSession, EvidencePackSummary } from '@/types/workSession';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, React.ElementType> = {
  Server,
  Layout,
  Layers,
};

// Category to icon mapping for personalized tests
const categoryIconMap: Record<string, React.ElementType> = {
  backend: Server,
  frontend: Layout,
  fullstack: Layers,
  security: Server,
  performance: TrendingUp,
  architecture: Layers,
  data: Server,
  devops: Server,
  testing: CheckCircle,
  'system-design': Layers,
  general: Target,
};

const TalentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [testHistory, setTestHistory] = useState<{ session: WorkSession; pack: EvidencePackSummary }[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<InterviewResult[]>([]);
  const [suggestedTests, setSuggestedTests] = useState<SuggestedTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const talentId = getStoredTalentId();

  useEffect(() => {
    const loadData = async () => {
      if (!talentId) {
        setIsLoading(false);
        return;
      }

      try {
        const [profileData, historyData, interviewData] = await Promise.all([
          getTalentProfile(talentId),
          getTalentEvidencePacks(talentId),
          getInterviewResultsForTalent(talentId),
        ]);

        setProfile(profileData);
        setTestHistory(historyData);
        setInterviewHistory(interviewData);

        // Load suggested tests based on weaknesses
        if (profileData?.consolidated_profile?.areasForGrowth?.length > 0) {
          setIsLoadingTests(true);
          try {
            const tests = await suggestTestsForWeaknesses(profileData.consolidated_profile.areasForGrowth);
            setSuggestedTests(tests);
          } catch (error) {
            console.error('Error loading suggested tests:', error);
          } finally {
            setIsLoadingTests(false);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [talentId]);


  const handleConsolidate = async () => {
    if (!talentId) return;

    setIsConsolidating(true);
    try {
      const updatedProfile = await consolidateTalentProfile(talentId);
      setProfile(updatedProfile);
      
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Error consolidating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleStartTest = () => {
    // Navigate to work session - all tests go to the same place for now
    navigate(`/work-session/start`);
  };

  const handleEditProfile = () => {
    setEditName(profile?.name || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!talentId) return;
    
    setIsSavingProfile(true);
    try {
      const updated = await updateTalentProfile(talentId, { name: editName.trim() || undefined });
      setProfile(updated);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen blush-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </main>
    );
  }

  // No profile yet - show onboarding with test selection
  if (!talentId || !profile) {
    return (
      <main className="min-h-screen blush-gradient">
        <div className="container max-w-2xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-foreground/5 mb-8">
                <User className="w-10 h-10 text-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Welcome to HumIQ
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Take a technical assessment to build your talent profile and get matched with opportunities.
              </p>
            </div>

            {/* Test Selection */}
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-medium text-foreground text-center mb-4">
                Choose your first assessment:
              </h2>
              {AVAILABLE_TESTS.map((test) => {
                const Icon = iconMap[test.icon] || Server;
                return (
                  <button
                    key={test.id}
                    onClick={() => handleStartTest()}
                    className="w-full p-5 rounded-2xl glass-card text-left group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent transition-colors duration-400">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-lg">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const consolidated = profile.consolidated_profile;

  return (
    <TooltipProvider delayDuration={0}>
      <main className="min-h-screen blush-gradient">
        <Navigation variant="talent" />
      <div className="container max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <User className="w-7 h-7 text-accent" />
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      className="h-9 text-lg font-display font-semibold w-48"
                      disabled={isSavingProfile}
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSaveProfile} 
                      disabled={isSavingProfile}
                      className="gap-1"
                    >
                      {isSavingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleCancelEdit}
                      disabled={isSavingProfile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                      {profile.name || 'Your Profile'}
                    </h1>
                    <Button variant="ghost" size="sm" onClick={handleEditProfile} className="opacity-60 hover:opacity-100">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Github className="w-4 h-4" />
                  {profile.github_url}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Banner for new profiles */}
          {testHistory.length === 1 && (
            <Card className="glass-card mb-6 bg-gradient-to-r from-accent/10 to-transparent border-accent/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">Profile setup complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Take technical tests to validate your skills. Companies will see your results and may send interview requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Summary Card - Show if we have any profile data */}
          {(consolidated?.summary || consolidated?.strengths?.length > 0 || consolidated?.areasForGrowth?.length > 0) && (
            <Card className="glass-card mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Profile Summary</span>
                  {consolidated?.overallLevel && (
                    <Badge variant="outline" className="text-accent border-accent/30">
                      {consolidated.overallLevel} level
                    </Badge>
                  )}
                </CardTitle>
                {consolidated?.summary && <CardDescription>{consolidated.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {consolidated?.strengths && consolidated.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-verdict-interview" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {consolidated.strengths.slice(0, 4).map((strength, i) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                            <span className="text-accent">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Weaknesses */}
                  {consolidated?.areasForGrowth && consolidated.areasForGrowth.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Potential Weaknesses
                      </h4>
                      <ul className="space-y-1">
                        {consolidated.areasForGrowth.slice(0, 4).map((weakness, i) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm text-muted-foreground mb-2">Validated Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 10).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill.name}
                            {skill.verified && <CheckCircle className="w-3 h-3 ml-1 text-accent" />}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid: Tests & Inbox */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengthen Your Skills - Dynamic tests based on weaknesses */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Strengthen Your Skills
                </CardTitle>
                <CardDescription>
                  {suggestedTests.length > 0
                    ? 'Recommended tests based on your profile analysis'
                    : profile?.onboarding_completed
                    ? 'Take tests to validate and improve your skills'
                    : 'Complete your profile to see personalized recommendations'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!profile?.onboarding_completed ? (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">Complete your profile first</p>
                    <p className="text-xs text-muted-foreground">
                      Finish your onboarding to see personalized test recommendations
                    </p>
                  </div>
                ) : isLoadingTests ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                    <p className="text-muted-foreground">Analyzing your profile...</p>
                  </div>
                ) : suggestedTests.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedTests.map((suggested) => {
                      const Icon = categoryIconMap[suggested.category || 'general'] || Target;
                      return (
                        <Tooltip key={suggested.id}>
                          <TooltipTrigger asChild>
                            <div
                              className="w-full p-4 rounded-lg bg-background/30 border border-border/30 text-left cursor-not-allowed opacity-60"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-muted-foreground">{suggested.name}</h4>
                                    {suggested.category && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground/60">
                                        {suggested.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground/70">{suggested.reason}</p>
                                </div>
                                <Clock className="w-4 h-4 text-muted-foreground/50" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Available soon</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* No suggested tests - show message */}
                    {consolidated?.areasForGrowth?.length === 0 && (
                      <div className="text-center py-4 mb-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-600">No specific areas for improvement detected!</p>
                        <p className="text-xs text-muted-foreground">Your profile looks strong.</p>
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="w-full p-4 rounded-lg bg-background/30 border border-border/30 text-left cursor-not-allowed opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              <Target className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-muted-foreground">Technical Assessment</h4>
                              <p className="text-xs text-muted-foreground/70">Take a comprehensive technical test to validate your skills</p>
                            </div>
                            <Clock className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Available soon</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Inbox */}
            {talentId && <InterviewInbox talentId={talentId} />}
          </div>

          {/* Interview History */}
          {interviewHistory.length > 0 && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  Interview History
                </CardTitle>
                <CardDescription>
                  {interviewHistory.length} {interviewHistory.length === 1 ? 'interview' : 'interviews'} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewHistory.map((result) => {
                    const jobTitle = result.interview_request?.job_posting?.title || 'Position';
                    const companyName = result.interview_request?.company?.name || result.interview_request?.company?.analyzed_data?.name || 'Company';
                    return (
                      <div
                        key={result.id}
                        className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-accent/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/interview/result/${result.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                            )}>
                              {result.passed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {jobTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {companyName} • {new Date(result.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                result.passed
                                  ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                  : 'border-red-500/30 text-red-500 bg-red-500/10'
                              )}
                            >
                              {result.passed ? 'Passed' : 'Failed'}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test History */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Technical Test History
              </CardTitle>
              <CardDescription>
                {testHistory.length} {testHistory.length === 1 ? 'test' : 'tests'} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tests completed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testHistory.map(({ session, pack }) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground capitalize">
                              {session.role_track} Engineering
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              pack.verdict === 'pass'
                                ? 'border-verdict-interview text-verdict-interview'
                                : 'border-verdict-pass text-verdict-pass'
                            }
                          >
                            {pack.verdict === 'pass' ? 'Passed' : 'Needs Work'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/evidence-pack/${session.id}`)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </motion.div>
      </div>
      </main>
    </TooltipProvider>
  );
};

export default TalentDashboard;
