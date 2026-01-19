import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Target,
  Lightbulb,
  Code2,
  Shield,
  Clock,
  Loader2,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEvidencePack } from '@/lib/workSession';
import { EvidencePackSummary, ConfidenceLevel, WorkSession } from '@/types/workSession';

const confidenceConfig: Record<ConfidenceLevel, { label: string; class: string }> = {
  high: { label: 'High Confidence', class: 'verdict-interview' },
  medium: { label: 'Medium Confidence', class: 'verdict-caution' },
  low: { label: 'Low Confidence', class: 'verdict-pass' },
};

const EvidencePack = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const shareId = searchParams.get('share');

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<EvidencePackSummary | null>(null);
  const [session, setSession] = useState<WorkSession | null>(null);
  const [packShareId, setPackShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPack() {
      try {
        const identifier = shareId
          ? { shareId }
          : sessionId
          ? { sessionId }
          : null;

        if (!identifier) {
          toast.error('Session or share ID required');
          navigate('/');
          return;
        }

        const result = await getEvidencePack(identifier);
        setSummary(result.summaryJson);
        setSession(result.session);
        setPackShareId(result.shareId);
      } catch (error) {
        console.error('Failed to load evidence pack:', error);
        toast.error('Evidence pack not found');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }

    loadPack();
  }, [sessionId, shareId, navigate]);

  const handleCopyLink = async () => {
    if (!packShareId) return;

    const shareUrl = `${window.location.origin}/evidence-pack/${sessionId}?share=${packShareId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Evidence Pack...</p>
        </div>
      </main>
    );
  }

  if (!summary) {
    return null;
  }

  const confidenceStyle = confidenceConfig[summary.confidence];

  return (
    <main className="min-h-screen bg-ambient">
      <div className="container max-w-4xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <Button
              onClick={handleCopyLink}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Share Link'}
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              HumIQ Evidence Pack
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
              Tech Work Session Results
            </h1>
            {session && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize">{session.role_track} Engineering</span>
                <span>•</span>
                <span className="capitalize">{session.level} Level</span>
                <span>•</span>
                <span>{session.duration} min session</span>
              </div>
            )}
          </div>

          {/* Confidence Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${confidenceStyle.class}`}>
              <Shield className="w-4 h-4" />
              <span className="font-medium">{confidenceStyle.label}</span>
            </div>
          </div>
        </motion.div>

        {/* Highlights */}
        {summary.highlights && summary.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-accent mt-0.5">•</span>
                      <span className="text-foreground/90">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* GitHub Summary */}
        {summary.github_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  GitHub Evidence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{summary.github_summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Strengths */}
        {summary.strengths && summary.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="section-header flex items-center gap-2">
              <Target className="w-4 h-4" />
              Observed Strengths
            </h2>
            <div className="space-y-4">
              {summary.strengths.map((strength, i) => (
                <Card key={i} className="glass-card-hover">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-verdict-interview/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-verdict-interview" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{strength.signal}</h3>
                        <p className="text-sm text-muted-foreground">{strength.evidence}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Decision Log */}
        {summary.decision_log && summary.decision_log.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="section-header flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Decision Log
            </h2>
            <div className="space-y-4">
              {summary.decision_log.map((item, i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Decision</Badge>
                        <span className="text-foreground font-medium">{item.decision}</span>
                      </div>
                      <div className="pl-4 border-l-2 border-border">
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="text-foreground/70">Tradeoff:</span> {item.tradeoff}
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                          "{item.example}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Execution Observations */}
        {summary.execution_observations && summary.execution_observations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="section-header flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Execution Observations
            </h2>
            <div className="space-y-3">
              {summary.execution_observations.map((obs, i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="pt-4">
                    <p className="text-foreground/90 mb-1">{obs.observation}</p>
                    <p className="text-sm text-muted-foreground italic">Example: "{obs.example}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Risks & Unknowns */}
        {summary.risks_or_unknowns && summary.risks_or_unknowns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="section-header flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risks & Unknowns
            </h2>
            <div className="space-y-4">
              {summary.risks_or_unknowns.map((risk, i) => (
                <Card key={i} className="glass-card border-verdict-caution/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-verdict-caution/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-verdict-caution" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{risk.signal}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-verdict-caution">Evidence gap:</span> {risk.evidence_gap}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Next Step */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card bg-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-accent">
                <ExternalLink className="w-5 h-5" />
                Recommended Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 text-lg">{summary.recommended_next_step}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Generated by HumIQ • Evidence-based hiring insights
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/work-session/start')}
              className="gap-2"
            >
              Start New Session
            </Button>
            <Button
              onClick={handleCopyLink}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Share Results
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default EvidencePack;
