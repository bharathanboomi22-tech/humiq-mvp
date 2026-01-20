import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Loader2,
  Building2,
  CheckCircle,
  AlertTriangle,
  Filter,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getStoredTalentId } from '@/lib/talent';
import { getMatchesForTalent } from '@/lib/matching';
import { Match, getMatchScoreLabel, getMatchScoreColor } from '@/types/matching';
import { supabase } from '@/integrations/supabase/client';

const TalentMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);

  const talentId = getStoredTalentId();

  const refreshMatches = useCallback(async () => {
    if (!talentId) return;
    try {
      const data = await getMatchesForTalent(talentId);
      setMatches(data);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    }
  }, [talentId]);

  useEffect(() => {
    const loadMatches = async () => {
      if (!talentId) {
        navigate('/talent/dashboard');
        return;
      }

      try {
        const data = await getMatchesForTalent(talentId);
        setMatches(data);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [talentId, navigate]);

  // Real-time subscription
  useEffect(() => {
    if (!talentId) return;

    const channel = supabase
      .channel('talent-matches-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `talent_profile_id=eq.${talentId}`,
        },
        (payload) => {
          refreshMatches();
          if (payload.eventType === 'INSERT') {
            toast.success('New match!', { icon: <Bell className="w-4 h-4" /> });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [talentId, refreshMatches]);

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
      <Navigation variant="talent" />
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
                <Briefcase className="w-8 h-8 text-accent" />
                Job Matches
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredMatches.length} opportunities matching your profile
              </p>
            </div>
          </div>

          {/* Filter */}
          <Card className="glass-card mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Minimum Match:</span>
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
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  {matches.length > 0
                    ? 'Try lowering the minimum score filter'
                    : 'Complete more assessments to improve your match score'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match) => {
                const job = match.job_posting;
                const company = match.company || job?.company;
                const breakdown = match.score_breakdown;
                const scoreLabel = getMatchScoreLabel(match.match_score);
                const scoreColor = getMatchScoreColor(match.match_score);
                const jobData = job?.analyzed_data;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className="glass-card hover:border-accent/30 transition-colors cursor-pointer"
                      onClick={() => job?.id && navigate(`/talent/job/${job.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-foreground">
                                {job?.title || 'Unknown Position'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {company?.analyzed_data?.sector || 'Company'}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {jobData?.roleType && (
                                  <Badge variant="outline" className="text-xs">
                                    {jobData.roleType}
                                  </Badge>
                                )}
                                {jobData?.level && (
                                  <Badge variant="outline" className="text-xs">
                                    {jobData.level}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-3xl font-bold ${scoreColor}`}>
                              {match.match_score}%
                            </span>
                            <p className="text-sm text-muted-foreground">{scoreLabel}</p>
                          </div>
                        </div>

                        {/* Job Summary */}
                        {jobData?.summary && (
                          <p className="text-sm text-foreground/80 mb-4">
                            {jobData.summary}
                          </p>
                        )}

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

                        {/* Your Matching Skills */}
                        <div className="flex flex-wrap gap-2">
                          {breakdown?.matchedSkills?.slice(0, 6).map((skill: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs gap-1">
                              <CheckCircle className="w-3 h-3 text-accent" />
                              {skill}
                            </Badge>
                          ))}
                          {breakdown?.missingSkills?.slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={`miss-${i}`} variant="outline" className="text-xs gap-1 opacity-60">
                              <AlertTriangle className="w-3 h-3 text-verdict-caution" />
                              Missing: {skill}
                            </Badge>
                          ))}
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

export default TalentMatches;
