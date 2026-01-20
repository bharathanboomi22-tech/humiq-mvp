import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Building2,
  Briefcase,
  Globe,
  ExternalLink,
  CheckCircle,
  Target,
  ListChecks,
  Layers,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getJobPosting } from '@/lib/company';
import { getTalentProfile, getStoredTalentId } from '@/lib/talent';
import { getMatchesForTalent } from '@/lib/matching';
import { getMatchScoreLabel, getMatchScoreColor } from '@/types/matching';
import { JobPosting } from '@/types/company';
import { TalentProfile } from '@/types/talent';
import { Match } from '@/types/matching';
import { SkillComparison } from '@/components/talent/SkillComparison';

const TalentJobDetail = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!jobId) {
        navigate('/talent/dashboard');
        return;
      }

      try {
        const talentId = getStoredTalentId();
        
        const [jobData, profileData] = await Promise.all([
          getJobPosting(jobId),
          talentId ? getTalentProfile(talentId) : Promise.resolve(null),
        ]);

        if (!jobData) {
          toast.error('Job posting not found');
          navigate('/talent/dashboard');
          return;
        }

        setJob(jobData);
        setProfile(profileData);

        // Get match info if we have a profile
        if (talentId && profileData) {
          const matches = await getMatchesForTalent(talentId);
          const existingMatch = matches.find((m) => m.job_posting_id === jobId);
          if (existingMatch) {
            setMatch(existingMatch);
          }
        }
      } catch (error) {
        console.error('Error loading job:', error);
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [jobId, navigate]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!job) {
    return null;
  }

  const analyzed = job.analyzed_data;
  const company = job.company;

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="talent" showBack />
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
                {job.title}
              </h1>
              {company && (
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Building2 className="w-4 h-4" />
                  <span>{company.analyzed_data?.sector || 'Technology'}</span>
                  <span className="text-border">•</span>
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-accent transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    {company.website_url.replace(/https?:\/\//, '').split('/')[0]}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">
                  {analyzed?.level || 'mid'} Level
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {analyzed?.roleType || 'engineering'}
                </Badge>
              </div>
            </div>
            
            {/* Match Score & Apply */}
            <div className="flex flex-col gap-3 items-end">
              {match && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Your Match</p>
                  <div className={`text-3xl font-display font-bold ${getMatchScoreColor(match.match_score)}`}>
                    {match.match_score}%
                  </div>
                  <Badge variant="outline" className={getMatchScoreColor(match.match_score)}>
                    {getMatchScoreLabel(match.match_score)}
                  </Badge>
                </div>
              )}
              <Button disabled className="gap-2">
                <Send className="w-4 h-4" />
                Apply
              </Button>
            </div>
          </div>

          {/* Match Score Breakdown */}
          {match?.score_breakdown && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Match Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="text-foreground font-medium">{match.score_breakdown.skillsMatch}%</span>
                    </div>
                    <Progress value={match.score_breakdown.skillsMatch} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Level</span>
                      <span className="text-foreground font-medium">{match.score_breakdown.levelMatch}%</span>
                    </div>
                    <Progress value={match.score_breakdown.levelMatch} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Tech Stack</span>
                      <span className="text-foreground font-medium">{match.score_breakdown.stackMatch}%</span>
                    </div>
                    <Progress value={match.score_breakdown.stackMatch} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Comparison */}
          {profile && analyzed?.requiredSkills && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent" />
                  Skills Comparison
                </CardTitle>
                <CardDescription>
                  How your skills match with the job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillComparison
                  requiredSkills={analyzed.requiredSkills}
                  niceToHaveSkills={analyzed.niceToHaveSkills}
                  talentSkills={profile.skills || []}
                />
              </CardContent>
            </Card>
          )}

          {/* Job Description */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                About the Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyzed?.summary && (
                <p className="text-foreground/90 leading-relaxed">{analyzed.summary}</p>
              )}
              
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3">Description</h4>
                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <div className="pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium text-foreground mb-3">Requirements</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {analyzed?.responsibilities && analyzed.responsibilities.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-accent" />
                    Responsibilities
                  </h4>
                  <ul className="space-y-2">
                    {analyzed.responsibilities.map((resp: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tech Stack */}
          {analyzed?.techStack && analyzed.techStack.length > 0 && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analyzed.techStack.map((tech: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {company && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  About the Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.analyzed_data?.summary && (
                  <p className="text-foreground/90 leading-relaxed">{company.analyzed_data.summary}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  {company.analyzed_data?.sector && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sector</p>
                      <p className="text-sm text-foreground">{company.analyzed_data.sector}</p>
                    </div>
                  )}
                  {company.analyzed_data?.size && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Size</p>
                      <p className="text-sm text-foreground">{company.analyzed_data.size}</p>
                    </div>
                  )}
                </div>

                {/* Tech Stack */}
                {company.analyzed_data?.techStack && company.analyzed_data.techStack.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Company Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {company.analyzed_data.techStack.map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Culture */}
                {company.analyzed_data?.culture && company.analyzed_data.culture.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Culture</p>
                    <div className="flex flex-wrap gap-1">
                      {company.analyzed_data.culture.map((trait: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Values */}
                {company.analyzed_data?.values && company.analyzed_data.values.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Values</p>
                    <div className="flex flex-wrap gap-1">
                      {company.analyzed_data.values.map((value: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs border-accent/30 text-accent">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default TalentJobDetail;
