import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Loader2,
  Github,
  CheckCircle,
  AlertTriangle,
  Filter,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getStoredCompanyId, getCompanyJobs } from '@/lib/company';
import { getMatchesForCompany } from '@/lib/matching';
import { Match, getMatchScoreLabel, getMatchScoreColor } from '@/types/matching';
import { createInterviewRequest } from '@/lib/interviews';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const CompanyMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);

  const companyId = getStoredCompanyId();

  const handleRequestInterview = async (e: React.MouseEvent, talentId: string, jobPostingId?: string) => {
    e.stopPropagation(); // Prevent card click
    if (!companyId) return;

    setRequestingInterview(talentId);
    try {
      await createInterviewRequest({
        companyId,
        talentId,
        jobPostingId,
      });
      toast.success('Interview request sent!');
    } catch (error: any) {
      console.error('Error requesting interview:', error);
      toast.error(error.message || 'Failed to send interview request');
    } finally {
      setRequestingInterview(null);
    }
  };

  const refreshMatches = useCallback(async () => {
    if (!companyId) return;
    try {
      const data = await getMatchesForCompany(companyId);
      setMatches(data);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    }
  }, [companyId]);

  useEffect(() => {
    const loadMatches = async () => {
      if (!companyId) {
        navigate('/company/setup');
        return;
      }

      try {
        const [matchesData, jobsData] = await Promise.all([
          getMatchesForCompany(companyId),
          getCompanyJobs(companyId),
        ]);
        setMatches(matchesData);
        setJobIds(jobsData.map(j => j.id));
      } catch (error) {
        console.error('Error loading matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [companyId, navigate]);

  // Real-time subscription
  useEffect(() => {
    if (!companyId || jobIds.length === 0) return;

    const channel = supabase
      .channel('company-matches-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          const matchJobId = (payload.new as any)?.job_posting_id || (payload.old as any)?.job_posting_id;
          if (matchJobId && jobIds.includes(matchJobId)) {
            refreshMatches();
            if (payload.eventType === 'INSERT') {
              toast.success('New talent match!', { icon: <Bell className="w-4 h-4" /> });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, jobIds, refreshMatches]);

  const filteredMatches = matches.filter((m) => m.match_score >= minScore);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="company" />
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-accent" />
                Talent Matches
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredMatches.length} matched talents for your open positions
              </p>
            </div>
          </div>

          {/* Filter */}
          <Card className="glass-card mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Minimum Score:</span>
                <div className="flex gap-2">
                  {[0, 40, 60, 80].map((score) => (
                    <Button
                      key={score}
                      variant={minScore === score ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMinScore(score)}
                    >
                      {score === 0 ? 'All' : `${score}%+`}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  {matches.length > 0
                    ? 'Try lowering the minimum score filter'
                    : 'Post more jobs to start matching with talents'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match) => {
                const talent = match.talent_profile;
                const breakdown = match.score_breakdown;
                const scoreLabel = getMatchScoreLabel(match.match_score);
                const scoreColor = getMatchScoreColor(match.match_score);

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className="glass-card hover:border-accent/30 transition-colors cursor-pointer"
                      onClick={() => talent?.id && navigate(`/company/talent/${talent.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                              <Github className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-foreground">
                                {talent?.name || 'Anonymous Talent'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                For: {match.job_posting?.title || 'Unknown position'}
                              </p>
                              {talent?.level && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {talent.level} level
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-3xl font-bold ${scoreColor}`}>
                              {match.match_score}%
                            </span>
                            <p className="text-sm text-muted-foreground">{scoreLabel}</p>
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Skills</span>
                              <span>{breakdown?.skillsMatch}%</span>
                            </div>
                            <Progress value={breakdown?.skillsMatch || 0} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Level</span>
                              <span>{breakdown?.levelMatch}%</span>
                            </div>
                            <Progress value={breakdown?.levelMatch || 0} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Stack</span>
                              <span>{breakdown?.stackMatch}%</span>
                            </div>
                            <Progress value={breakdown?.stackMatch || 0} className="h-1.5" />
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {breakdown?.matchedSkills?.slice(0, 6).map((skill: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs gap-1">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              {skill}
                            </Badge>
                          ))}
                          {breakdown?.missingSkills?.slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={`miss-${i}`} variant="outline" className="text-xs gap-1 opacity-60">
                              <AlertTriangle className="w-3 h-3 text-verdict-caution" />
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-border/50">
                          <Button
                            variant="outline"
                            onClick={() => talent?.id && navigate(`/company/talent/${talent.id}`)}
                            className="flex-1"
                          >
                            View Profile
                          </Button>
                          <Button
                            onClick={(e) => handleRequestInterview(e, talent?.id || '', match.job_posting?.id)}
                            disabled={!talent?.id || requestingInterview === talent.id}
                            className="flex-1 gap-2"
                          >
                            {requestingInterview === talent?.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4" />
                                Request Interview
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default CompanyMatches;
