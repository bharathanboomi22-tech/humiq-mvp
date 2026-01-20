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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import {
  getStoredTalentId,
  getTalentProfile,
  getTalentEvidencePacks,
  consolidateTalentProfile,
  updateTalentProfile,
} from '@/lib/talent';
import { TalentProfile, AVAILABLE_TESTS } from '@/types/talent';
import { InterviewInbox } from '@/components/talent/InterviewInbox';
import { WorkSession, EvidencePackSummary } from '@/types/workSession';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, React.ElementType> = {
  Server,
  Layout,
  Layers,
};

const TalentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [testHistory, setTestHistory] = useState<{ session: WorkSession; pack: EvidencePackSummary }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const [profileData, historyData] = await Promise.all([
          getTalentProfile(talentId),
          getTalentEvidencePacks(talentId),
        ]);

        setProfile(profileData);
        setTestHistory(historyData);
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

  const handleStartTest = (roleTrack: string) => {
    // Navigate to work session with pre-filled role track
    navigate(`/work-session/start?role=${roleTrack}`);
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
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  // No profile yet - show onboarding with test selection
  if (!talentId || !profile) {
    return (
      <main className="min-h-screen bg-ambient">
        <div className="container max-w-2xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 mb-8">
                <User className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
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
                    onClick={() => handleStartTest(test.roleTrack)}
                    className="w-full p-5 rounded-xl glass-card text-left group hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-lg">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
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
    <main className="min-h-screen bg-ambient">
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
            <Button onClick={handleConsolidate} disabled={isConsolidating} variant="outline" className="gap-2">
              {isConsolidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              Update Profile
            </Button>
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

          {/* Profile Summary Card */}
          {consolidated?.summary && (
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
                <CardDescription>{consolidated.summary}</CardDescription>
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

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
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
            {/* Take New Tests */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent" />
                  Available Tests
                </CardTitle>
                <CardDescription>
                  {profile?.discovery_completed
                    ? 'Take tests to validate your skills'
                    : 'Complete your profile discovery to see recommended tests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!profile?.discovery_completed ? (
                  <div className="text-center py-8">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">Complete discovery first</p>
                    <p className="text-xs text-muted-foreground">
                      Finish your onboarding to see personalized test recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {AVAILABLE_TESTS.map((test) => {
                      const Icon = iconMap[test.icon] || Server;
                      return (
                        <button
                          key={test.id}
                          onClick={() => handleStartTest(test.roleTrack)}
                          className="w-full p-4 rounded-lg bg-background/50 border border-border/50 hover:border-accent/30 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{test.name}</h4>
                              <p className="text-xs text-muted-foreground">{test.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Inbox */}
            {talentId && <InterviewInbox talentId={talentId} />}
          </div>

          {/* Test History */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Test History
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
  );
};

export default TalentDashboard;
