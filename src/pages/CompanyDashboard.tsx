import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Briefcase,
  Users,
  User,
  Plus,
  Edit2,
  Globe,
  Code2,
  Heart,
  Loader2,
  ArrowRight,
  Bell,
  Save,
  X,
  Clock,
  CheckCircle,
  XCircle,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { Textarea } from '@/components/ui/textarea';
import { getStoredCompanyId, getCompany, getCompanyJobs, toggleJobActive, updateCompany } from '@/lib/company';
import { Switch } from '@/components/ui/switch';
import { getMatchesForCompany } from '@/lib/matching';
import { getInterviewRequestForMatch, getInterviewResultForRequest, getInterviewResultsForCompany, InterviewResult, InterviewResultWithTalent } from '@/lib/interviews';
import { InterviewRequest } from '@/components/talent/InterviewInbox';
import { Company, JobPosting } from '@/types/company';
import { Match } from '@/types/matching';
import { supabase } from '@/integrations/supabase/client';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [interviewRequests, setInterviewRequests] = useState<Map<string, InterviewRequest>>(new Map());
  const [interviewResults, setInterviewResults] = useState<Map<string, InterviewResult>>(new Map());
  const [completedInterviews, setCompletedInterviews] = useState<InterviewResultWithTalent[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewResultWithTalent | null>(null);

  // Refresh matches function
  const refreshMatches = useCallback(async () => {
    if (!companyId) return;
    try {
      const matchesData = await getMatchesForCompany(companyId);
      setMatches(matchesData);

      // Load interview requests for matches
      const interviewRequestsMap = new Map<string, InterviewRequest>();
      const interviewResultsMap = new Map<string, InterviewResult>();
      
      for (const match of matchesData) {
        if (match.talent_profile?.id && match.job_posting?.id) {
          const interviewRequest = await getInterviewRequestForMatch(
            match.talent_profile.id,
            match.job_posting.id
          );
          if (interviewRequest) {
            const key = `${match.talent_profile.id}-${match.job_posting.id}`;
            interviewRequestsMap.set(key, interviewRequest);
            
            // Load interview result for completed interviews
            if (interviewRequest.status === 'completed') {
              const result = await getInterviewResultForRequest(interviewRequest.id);
              if (result) {
                interviewResultsMap.set(key, result);
              }
            }
          }
        }
      }
      setInterviewRequests(interviewRequestsMap);
      setInterviewResults(interviewResultsMap);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    }
  }, [companyId]);

  useEffect(() => {
    const loadData = async () => {
      const storedCompanyId = getStoredCompanyId();
      
      if (!storedCompanyId) {
        navigate('/company/setup');
        return;
      }

      setCompanyId(storedCompanyId);

      try {
        const [companyData, jobsData, matchesData, interviewResultsData] = await Promise.all([
          getCompany(storedCompanyId),
          getCompanyJobs(storedCompanyId, true), // Include inactive jobs
          getMatchesForCompany(storedCompanyId),
          getInterviewResultsForCompany(storedCompanyId),
        ]);

        if (!companyData) {
          toast.error('Company not found');
          navigate('/company/setup');
          return;
        }

        setCompany(companyData);
        setJobs(jobsData);
        setMatches(matchesData);
        setCompletedInterviews(interviewResultsData);

        // Load interview requests for matches
        const interviewRequestsMap = new Map<string, InterviewRequest>();
        for (const match of matchesData) {
          if (match.talent_profile?.id && match.job_posting?.id) {
            try {
              const interviewRequest = await getInterviewRequestForMatch(
                match.talent_profile.id,
                match.job_posting.id
              );
              if (interviewRequest) {
                const key = `${match.talent_profile.id}-${match.job_posting.id}`;
                interviewRequestsMap.set(key, interviewRequest);
              }
            } catch (error) {
              console.error('Error loading interview request:', error);
            }
          }
        }
        setInterviewRequests(interviewRequestsMap);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Real-time subscription for matches
  useEffect(() => {
    if (!companyId || jobs.length === 0) return;

    // Subscribe to matches for all job postings of this company
    const jobIds = jobs.map(j => j.id);
    
    const channel = supabase
      .channel('company-matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          // Check if this match is for one of our jobs
          const matchJobId = (payload.new as any)?.job_posting_id || (payload.old as any)?.job_posting_id;
          if (matchJobId && jobIds.includes(matchJobId)) {
            console.log('Match update received:', payload);
            refreshMatches();
            if (payload.eventType === 'INSERT') {
              toast.success('New talent match found!', {
                icon: <Bell className="w-4 h-4" />,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, jobs, refreshMatches]);

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

  const analyzed = company.analyzed_data;

  return (
    <main className="min-h-screen blush-gradient">
      <Navigation variant="company" />
      <div className="container max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                    {company.name || 'Company Dashboard'}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {company.website_url}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/company/jobs/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              Post a Job
            </Button>
          </div>

          {/* Company Profile Card */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">Company Profile</CardTitle>
                  <CardDescription>{analyzed?.summary || 'No summary available'}</CardDescription>
                </div>
                {!isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditDescription(company?.description || '');
                      setIsEditingDescription(true);
                    }}
                    className="opacity-60 hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {isEditingDescription && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description about your company..."
                    className="min-h-[100px]"
                    disabled={isSaving}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!companyId) return;
                        setIsSaving(true);
                        try {
                          const updated = await updateCompany(companyId, { description: editDescription.trim() });
                          setCompany(updated);
                          setIsEditingDescription(false);
                          toast.success('Description updated!');
                        } catch (error) {
                          toast.error('Failed to save description');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className="gap-1"
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingDescription(false)}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">Sector</h4>
                    <Badge variant="secondary">{analyzed?.sector || 'Unknown'}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">Company Size</h4>
                    <Badge variant="outline">{analyzed?.size || 'Unknown'}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Code2 className="w-4 h-4" /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analyzed?.techStack?.slice(0, 8).map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      )) || <span className="text-muted-foreground text-sm">Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Heart className="w-4 h-4" /> Values
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analyzed?.values?.map((value: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs bg-accent/5">
                          {value}
                        </Badge>
                      )) || <span className="text-muted-foreground text-sm">Not specified</span>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid: Jobs & Matches */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Jobs */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  Job Postings
                </CardTitle>
                <CardDescription>
                  {jobs.filter(j => j.is_active).length} active / {jobs.length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No job postings yet</p>
                    <Button onClick={() => navigate('/company/jobs/new')} variant="outline" size="sm">
                      Create your first job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          job.is_active 
                            ? 'bg-background/50 border-border/50 hover:border-accent/30' 
                            : 'bg-background/30 border-border/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">{job.title}</h4>
                              {!job.is_active && (
                                <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {job.analyzed_data?.roleType || 'engineering'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {job.analyzed_data?.level || 'mid'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={job.is_active}
                              onCheckedChange={async (checked) => {
                                try {
                                  await toggleJobActive(job.id, checked);
                                  setJobs(prev => prev.map(j => 
                                    j.id === job.id ? { ...j, is_active: checked } : j
                                  ));
                                  toast.success(checked ? 'Job activated' : 'Job deactivated');
                                } catch (error) {
                                  toast.error('Failed to update job status');
                                }
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {jobs.length > 5 && (
                      <Button variant="ghost" className="w-full text-muted-foreground">
                        View all {jobs.length} jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Matched Talents */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Matched Talents
                  {(() => {
                    const newCount = matches.filter(m => {
                      const createdAt = new Date(m.created_at);
                      const now = new Date();
                      return (now.getTime() - createdAt.getTime()) < 24 * 60 * 60 * 1000;
                    }).length;
                    return newCount > 0 ? (
                      <Badge variant="default" className="ml-1 text-xs bg-accent">
                        {newCount} new
                      </Badge>
                    ) : null;
                  })()}
                </CardTitle>
                <CardDescription>
                  {matches.length} talent {matches.length === 1 ? 'match' : 'matches'} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No matches yet</p>
                    <p className="text-xs text-muted-foreground">
                      Post jobs to start matching with talents
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 5).map((match) => {
                      const interviewKey = match.talent_profile?.id && match.job_posting?.id 
                        ? `${match.talent_profile.id}-${match.job_posting.id}` 
                        : null;
                      const interviewRequest = interviewKey ? interviewRequests.get(interviewKey) : null;
                      const interviewResult = interviewKey ? interviewResults.get(interviewKey) : null;

                      const getStatusBadge = (status: string, result?: InterviewResult) => {
                        switch (status) {
                          case 'pending':
                            return (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-xs gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </Badge>
                            );
                          case 'accepted':
                            return (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs gap-1">
                                <Clock className="w-3 h-3" />
                                In Progress
                              </Badge>
                            );
                          case 'declined':
                            return (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs gap-1">
                                <XCircle className="w-3 h-3" />
                                Declined
                              </Badge>
                            );
                          case 'completed':
                            if (result?.passed) {
                              return (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Passed
                                </Badge>
                              );
                            } else {
                              return (
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-xs gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Failed
                                </Badge>
                              );
                            }
                          default:
                            return null;
                        }
                      };

                      return (
                        <div
                          key={match.id}
                          onClick={() => match.talent_profile?.id && navigate(`/company/talent/${match.talent_profile.id}`)}
                          className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-accent/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">
                                {match.talent_profile?.name || 'Anonymous Talent'}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                For: {match.job_posting?.title || 'Unknown position'}
                              </p>
                              {interviewRequest && (
                                <div className="mt-1">
                                  {getStatusBadge(interviewRequest.status, interviewResult || undefined)}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-accent">
                                {match.match_score}%
                              </span>
                              <p className="text-xs text-muted-foreground">match</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {matches.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground gap-2"
                        onClick={() => navigate('/company/matches')}
                      >
                        View all matches
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Interviews */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Interview Results
                  {completedInterviews.filter(i => i.passed).length > 0 && (
                    <Badge variant="default" className="ml-1 text-xs bg-green-500">
                      {completedInterviews.filter(i => i.passed).length} passed
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {completedInterviews.length} {completedInterviews.length === 1 ? 'interview' : 'interviews'} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No completed interviews yet</p>
                    <p className="text-xs text-muted-foreground">
                      Interview results will appear here once candidates complete their interviews
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedInterviews.map((result) => {
                      const talentName = result.interview_request?.talent_profile?.name || 'Anonymous Talent';
                      const jobTitle = result.interview_request?.job_posting?.title || 'Position';
                      const fitScore = result.company_recap?.fitScore || 0;
                      const recommendation = result.company_recap?.recommendation || 'N/A';
                      
                      return (
                        <div
                          key={result.id}
                          onClick={() => setSelectedInterview(result)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-accent/50 ${
                            result.passed 
                              ? 'bg-green-500/5 border-green-500/30' 
                              : 'bg-red-500/5 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground">{talentName}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    result.passed
                                      ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                      : 'bg-red-500/10 text-red-500 border-red-500/30'
                                  }`}
                                >
                                  {result.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                For: {jobTitle}
                              </p>
                              <p className="text-sm text-foreground/80 line-clamp-2">
                                {result.company_recap?.summary || 'No summary available'}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <span className={`text-lg font-semibold ${
                                fitScore >= 70 ? 'text-green-500' : fitScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {fitScore}%
                              </span>
                              <p className="text-xs text-muted-foreground">fit score</p>
                              <Badge
                                variant="outline"
                                className={`mt-1 text-xs ${
                                  recommendation === 'hire' 
                                    ? 'border-green-500/30 text-green-500' 
                                    : recommendation === 'maybe'
                                    ? 'border-yellow-500/30 text-yellow-500'
                                    : 'border-red-500/30 text-red-500'
                                }`}
                              >
                                {recommendation}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </motion.div>
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedInterview(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-border/50"
          >
            {/* Header with gradient */}
            <div className={`p-6 border-b border-border/50 ${
              selectedInterview.passed 
                ? 'bg-gradient-to-r from-green-500/10 to-transparent' 
                : 'bg-gradient-to-r from-red-500/10 to-transparent'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedInterview.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {selectedInterview.passed ? (
                      <CheckCircle className="w-7 h-7 text-green-500" />
                    ) : (
                      <XCircle className="w-7 h-7 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {selectedInterview.interview_request?.talent_profile?.name || 'Candidate'}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedInterview.interview_request?.job_posting?.title || 'Position'} • Interview completed {new Date(selectedInterview.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedInterview(null)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Scores Section */}
            <div className="px-6 py-5 border-b border-border/50 bg-background/30">
              <div className="flex items-center justify-between gap-6">
                {/* Result */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedInterview.passed 
                      ? 'bg-green-500/20 ring-2 ring-green-500/30' 
                      : 'bg-red-500/20 ring-2 ring-red-500/30'
                  }`}>
                    {selectedInterview.passed ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Interview Result</p>
                    <p className={`text-lg font-semibold ${
                      selectedInterview.passed ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {selectedInterview.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-12 w-px bg-border/50" />

                {/* Fit Score - Circular Progress Style */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-border/30"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${(selectedInterview.company_recap?.fitScore || 0) * 0.88} 88`}
                        strokeLinecap="round"
                        className={
                          (selectedInterview.company_recap?.fitScore || 0) >= 70 
                            ? 'text-green-500' 
                            : (selectedInterview.company_recap?.fitScore || 0) >= 50 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                        }
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                      (selectedInterview.company_recap?.fitScore || 0) >= 70 
                        ? 'text-green-500' 
                        : (selectedInterview.company_recap?.fitScore || 0) >= 50 
                        ? 'text-yellow-500' 
                        : 'text-red-500'
                    }`}>
                      {selectedInterview.company_recap?.fitScore || 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Fit Score</p>
                    <p className="text-lg font-semibold text-foreground">
                      {(selectedInterview.company_recap?.fitScore || 0) >= 70 ? 'Strong' : 
                       (selectedInterview.company_recap?.fitScore || 0) >= 50 ? 'Moderate' : 'Low'} Match
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-12 w-px bg-border/50" />

                {/* Recommendation */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedInterview.company_recap?.recommendation === 'hire'
                      ? 'bg-green-500/20 ring-2 ring-green-500/30'
                      : selectedInterview.company_recap?.recommendation === 'maybe'
                      ? 'bg-yellow-500/20 ring-2 ring-yellow-500/30'
                      : 'bg-red-500/20 ring-2 ring-red-500/30'
                  }`}>
                    {selectedInterview.company_recap?.recommendation === 'hire' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : selectedInterview.company_recap?.recommendation === 'maybe' ? (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Recommendation</p>
                    <p className={`text-lg font-semibold capitalize ${
                      selectedInterview.company_recap?.recommendation === 'hire'
                        ? 'text-green-500'
                        : selectedInterview.company_recap?.recommendation === 'maybe'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}>
                      {selectedInterview.company_recap?.recommendation === 'hire' ? 'Hire' :
                       selectedInterview.company_recap?.recommendation === 'maybe' ? 'Consider' : 'Reject'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-accent" />
                      Assessment Summary
                    </h3>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-foreground leading-relaxed">
                        {selectedInterview.company_recap?.summary || 'No summary available'}
                      </p>
                    </div>
                  </div>

                  {/* Skills Assessed */}
                  {selectedInterview.company_recap?.skillsAssessed && selectedInterview.company_recap.skillsAssessed.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        Skills Assessed
                      </h3>
                      <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                        <div className="grid grid-cols-1 gap-2">
                          {selectedInterview.company_recap.skillsAssessed.map((skill, index) => {
                            const [skillName, level] = skill.includes(':') ? skill.split(':').map(s => s.trim()) : [skill, 'Assessed'];
                            const isStrong = level.toLowerCase().includes('strong') || level.toLowerCase().includes('good');
                            const isWeak = level.toLowerCase().includes('weak') || level.toLowerCase().includes('needs') || level.toLowerCase().includes('improvement');
                            return (
                              <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                <span className="text-foreground font-medium">{skillName}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    isStrong ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                                    isWeak ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                    'border-accent/30 text-accent bg-accent/10'
                                  }`}
                                >
                                  {level}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Red Flags */}
                  {selectedInterview.company_recap?.redFlags && selectedInterview.company_recap.redFlags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Red Flags ({selectedInterview.company_recap.redFlags.length})
                      </h3>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <ul className="space-y-3">
                          {selectedInterview.company_recap.redFlags.map((flag, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-500 text-xs font-bold">{index + 1}</span>
                              </div>
                              <span className="text-foreground">{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* No Red Flags */}
                  {(!selectedInterview.company_recap?.redFlags || selectedInterview.company_recap.redFlags.length === 0) && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-500 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        No Red Flags
                      </h3>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <p className="text-foreground">No concerns or red flags were identified during this interview.</p>
                      </div>
                    </div>
                  )}

                  {/* Candidate Card */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" />
                      Candidate Info
                    </h3>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {selectedInterview.interview_request?.talent_profile?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInterview.interview_request?.talent_profile?.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedInterview.interview_request?.talent_profile?.github_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedInterview.interview_request?.talent_profile?.github_url, '_blank')}
                            className="flex-1 gap-2"
                          >
                            <Code2 className="w-4 h-4" />
                            GitHub
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInterview(null);
                            navigate(`/company/talent/${selectedInterview.interview_request?.talent_profile?.id}`);
                          }}
                          className="flex-1 gap-2"
                        >
                          View Full Profile
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default CompanyDashboard;
