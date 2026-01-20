import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Github,
  User,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Mail,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getTalentProfile, getTalentEvidencePacks } from '@/lib/talent';
import { TalentProfile, TalentSkill } from '@/types/talent';
import { WorkSession, EvidencePackSummary } from '@/types/workSession';

const skillLevelConfig = {
  beginner: { label: 'Beginner', value: 25, class: 'text-muted-foreground' },
  intermediate: { label: 'Intermediate', value: 50, class: 'text-verdict-caution' },
  advanced: { label: 'Advanced', value: 75, class: 'text-accent' },
  expert: { label: 'Expert', value: 100, class: 'text-verdict-interview' },
};

const CompanyTalentDetail = () => {
  const navigate = useNavigate();
  const { talentId } = useParams<{ talentId: string }>();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [testHistory, setTestHistory] = useState<{ session: WorkSession; pack: EvidencePackSummary }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!talentId) {
        navigate('/company/dashboard');
        return;
      }

      try {
        const [profileData, historyData] = await Promise.all([
          getTalentProfile(talentId),
          getTalentEvidencePacks(talentId),
        ]);

        if (!profileData) {
          toast.error('Talent profile not found');
          navigate('/company/matches');
          return;
        }

        setProfile(profileData);
        setTestHistory(historyData);
      } catch (error) {
        console.error('Error loading talent:', error);
        toast.error('Failed to load talent profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [talentId, navigate]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const consolidated = profile.consolidated_profile;
  const skills = profile.skills || [];

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="company" showBack />
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
                {profile.name || 'Anonymous Talent'}
              </h1>
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent flex items-center gap-1 text-sm transition-colors"
              >
                <Github className="w-4 h-4" />
                {profile.github_url}
                <ExternalLink className="w-3 h-3" />
              </a>
              {profile.level && (
                <Badge variant="outline" className="mt-2 capitalize">
                  {profile.level} Level
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled className="gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </Button>
            </div>
          </div>

          {/* Profile Summary */}
          {consolidated?.summary && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed mb-6">{consolidated.summary}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {consolidated.strengths && consolidated.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-verdict-interview" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {consolidated.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                            <span className="text-accent mt-0.5">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Growth */}
                  {consolidated.areasForGrowth && consolidated.areasForGrowth.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-verdict-caution" />
                        Areas for Growth
                      </h4>
                      <ul className="space-y-2">
                        {consolidated.areasForGrowth.map((area: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                            <span className="text-verdict-caution mt-0.5">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Signals */}
                {consolidated.signals && consolidated.signals.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <h4 className="text-sm text-muted-foreground mb-3">Signal Synthesis</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {consolidated.signals.map((signal: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground text-sm">{signal.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                signal.level === 'high'
                                  ? 'border-verdict-interview text-verdict-interview'
                                  : signal.level === 'medium'
                                  ? 'border-verdict-caution text-verdict-caution'
                                  : 'border-verdict-pass text-verdict-pass'
                              }`}
                            >
                              {signal.level}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{signal.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  Validated Skills
                </CardTitle>
                <CardDescription>
                  {skills.length} skills demonstrated through assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {skills.map((skill: TalentSkill, i: number) => {
                    const config = skillLevelConfig[skill.level] || skillLevelConfig.intermediate;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground text-sm flex items-center gap-1">
                            {skill.name}
                            {skill.verified && (
                              <CheckCircle className="w-3 h-3 text-accent" />
                            )}
                          </span>
                          <span className={`text-xs ${config.class}`}>{config.label}</span>
                        </div>
                        <Progress value={config.value} className="h-1.5" />
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
                <Clock className="w-5 h-5 text-accent" />
                Assessment History
              </CardTitle>
              <CardDescription>
                {testHistory.length} {testHistory.length === 1 ? 'assessment' : 'assessments'} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testHistory.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed assessments yet</p>
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
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/evidence-pack/${session.id}`)}
                            className="gap-1"
                          >
                            View Report
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Highlights */}
                      {pack.highlights && pack.highlights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs text-muted-foreground mb-2">Highlights:</p>
                          <ul className="space-y-1">
                            {pack.highlights.slice(0, 3).map((highlight: string, i: number) => (
                              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                                <span className="text-accent">•</span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default CompanyTalentDetail;
