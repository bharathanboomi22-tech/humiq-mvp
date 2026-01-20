import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Briefcase,
  Users,
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

  // Refresh matches function
  const refreshMatches = useCallback(async () => {
    if (!companyId) return;
    try {
      const matchesData = await getMatchesForCompany(companyId);
      setMatches(matchesData);
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
        const [companyData, jobsData, matchesData] = await Promise.all([
          getCompany(storedCompanyId),
          getCompanyJobs(storedCompanyId, true), // Include inactive jobs
          getMatchesForCompany(storedCompanyId),
        ]);

        if (!companyData) {
          toast.error('Company not found');
          navigate('/company/setup');
          return;
        }

        setCompany(companyData);
        setJobs(jobsData);
        setMatches(matchesData);
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
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!company) {
    return null;
  }

  const analyzed = company.analyzed_data;

  return (
    <main className="min-h-screen bg-ambient">
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
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                    Company Dashboard
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

            {/* Talent Matches */}
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
                    {matches.slice(0, 5).map((match) => (
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
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-accent">
                              {match.match_score}%
                            </span>
                            <p className="text-xs text-muted-foreground">match</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
          </div>

        </motion.div>
      </div>
    </main>
  );
};

export default CompanyDashboard;
