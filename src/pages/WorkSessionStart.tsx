import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Github, Clock, Code2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorkSession } from '@/lib/workSession';
import { RoleTrack, SessionLevel, SessionDuration } from '@/types/workSession';

const WorkSessionStart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [githubUrl, setGithubUrl] = useState(searchParams.get('github') || '');
  const [roleTrack, setRoleTrack] = useState<RoleTrack>('backend');
  const [level, setLevel] = useState<SessionLevel>('mid');
  const [duration, setDuration] = useState<SessionDuration>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGitHubData, setHasGitHubData] = useState(false);

  // Check for stored GitHub URL
  useEffect(() => {
    const storedGithub = localStorage.getItem('humiq_github_url');
    if (storedGithub && !githubUrl) {
      setGithubUrl(storedGithub);
    }
  }, []);

  // Validate GitHub URL format
  useEffect(() => {
    const isValidGithub = githubUrl.includes('github.com/');
    setHasGitHubData(isValidGithub);
  }, [githubUrl]);

  const handleStart = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter your GitHub profile URL');
      return;
    }

    setIsLoading(true);

    try {
      // Store GitHub URL for future use
      localStorage.setItem('humiq_github_url', githubUrl.trim());

      const result = await createWorkSession({
        githubUrl: githubUrl.trim(),
        roleTrack,
        level,
        duration,
      });

      toast.success('Work session created!');
      navigate(`/work-session/live/${result.sessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ambient">
      <div className="container max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Tech Work Session
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Show your real work
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            A guided conversation about how you approach technical problems. 
            No leetcode, no gotchas — just real work discussion.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Configure Your Session</CardTitle>
              <CardDescription>
                We'll tailor the conversation to your background and the role you're exploring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GitHub URL */}
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Profile URL
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-card/50"
                />
                {hasGitHubData && (
                  <p className="text-sm text-verdict-interview flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    We'll review your repos to tailor the session
                  </p>
                )}
              </div>

              {/* Role Track */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Role Track
                </Label>
                <Select
                  value={roleTrack}
                  onValueChange={(v) => setRoleTrack(v as RoleTrack)}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backend">Backend Engineering</SelectItem>
                    <SelectItem value="frontend">Frontend Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={level}
                  onValueChange={(v) => setLevel(v as SessionLevel)}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Session Duration
                </Label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(Number(v) as SessionDuration)}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes (Quick)</SelectItem>
                    <SelectItem value="30">30 minutes (Standard)</SelectItem>
                    <SelectItem value="45">45 minutes (Deep Dive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Session Format Info */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                <h4 className="font-medium text-sm text-foreground">Session Format</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">1.</span>
                    <span><strong className="text-foreground/80">Problem Framing</strong> — Understand requirements and constraints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">2.</span>
                    <span><strong className="text-foreground/80">Solution Approach</strong> — Discuss design and tradeoffs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">3.</span>
                    <span><strong className="text-foreground/80">Build</strong> — Walk through implementation or pseudocode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">4.</span>
                    <span><strong className="text-foreground/80">Review</strong> — Edge cases, testing, observability</span>
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStart}
                disabled={isLoading || !githubUrl.trim()}
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up session...
                  </>
                ) : (
                  <>
                    Start Work Session
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Your responses generate a shareable Evidence Pack for hiring managers
        </motion.p>
      </div>
    </main>
  );
};

export default WorkSessionStart;
