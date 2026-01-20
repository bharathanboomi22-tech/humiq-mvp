import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Clock, CheckCircle, XCircle, Mail } from 'lucide-react';
import { getInterviewRequests, respondToInterviewRequest, getInterviewResultForRequest, InterviewResult } from '@/lib/interviews';
import { getTalentProfile } from '@/lib/talent';
import { createWorkSession } from '@/lib/workSession';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface InterviewRequest {
  id: string;
  company_id: string;
  job_posting_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string | null;
  requested_at: string;
  responded_at: string | null;
  company?: {
    name?: string;
    website_url: string;
    analyzed_data?: {
      name?: string;
      sector?: string;
    };
  };
  job_posting?: {
    title: string;
    description: string;
  };
}

interface InterviewInboxProps {
  talentId: string;
}

export const InterviewInbox = ({ talentId }: InterviewInboxProps) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<InterviewRequest[]>([]);
  const [interviewResults, setInterviewResults] = useState<Map<string, InterviewResult>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getInterviewRequests(talentId);
        setRequests(data);

        // Load interview results for completed requests
        const resultsMap = new Map<string, InterviewResult>();
        for (const request of data) {
          if (request.status === 'completed') {
            try {
              const result = await getInterviewResultForRequest(request.id);
              if (result) {
                resultsMap.set(request.id, result);
              }
            } catch (error) {
              console.error('Error loading interview result:', error);
            }
          }
        }
        setInterviewResults(resultsMap);
      } catch (error) {
        console.error('Error loading interview requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();

    // Subscribe to real-time changes for interview requests
    const channel = supabase
      .channel(`interview-requests-${talentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_requests',
          filter: `talent_profile_id=eq.${talentId}`,
        },
        async (payload) => {
          // Reload requests when there's a change
          try {
            const data = await getInterviewRequests(talentId);
            setRequests(data);
          } catch (error) {
            console.error('Error reloading interview requests:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [talentId]);

  const handleRespond = async (requestId: string, status: 'accepted' | 'declined') => {
    setResponding(requestId);
    try {
      // Find the request to get job posting info
      const request = requests.find(r => r.id === requestId);
      
      await respondToInterviewRequest(requestId, status);
      
      if (status === 'accepted' && request) {
        // Get talent profile for GitHub URL (optional)
        const profile = await getTalentProfile(talentId);
        const workLinks = profile?.work_links as Array<{ type: string; url: string }> | null;
        const githubUrl = profile?.github_url || 
          workLinks?.find((l) => l.type === 'github')?.url || '';
        
        // Create work session for the interview (GitHub is optional)
        const result = await createWorkSession({
          githubUrl: githubUrl || '', // Empty string if no GitHub
          roleTrack: 'backend', // Default for demo
          level: 'mid',
          duration: 5, // Demo mode
          jobPostingId: request.job_posting_id || undefined,
          interviewRequestId: requestId,
        });
        
        toast.success('Interview started!');
        navigate(`/work-session/live/${result.sessionId}`);
        return;
      }
      
      // Update local state for declined
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, responded_at: new Date().toISOString() } : r))
      );
      toast.success('Interview request declined');
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to respond to request');
      
      // Revert status on error
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'pending', responded_at: null } : r))
      );
    } finally {
      setResponding(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const otherRequests = requests.filter((r) => r.status !== 'pending');

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            Interview Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-accent" />
          Interview Inbox
          {pendingRequests.length > 0 && (
            <Badge variant="default" className="ml-1 text-xs bg-accent">
              {pendingRequests.length} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {requests.length === 0
            ? 'No interview requests yet'
            : `${pendingRequests.length} pending, ${otherRequests.length} ${otherRequests.length === 1 ? 'other' : 'others'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No interview requests yet</p>
            <p className="text-xs text-muted-foreground">
              Companies will send interview requests when they're interested in your profile
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending requests */}
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-accent/30 bg-accent/5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-accent" />
                      <h4 className="font-medium text-foreground">
                        {request.company?.name || request.company?.analyzed_data?.name || 'Company'}
                      </h4>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        New
                      </Badge>
                    </div>
                    {request.job_posting && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Position: {request.job_posting.title}
                      </p>
                    )}
                    {request.message && (
                      <p className="text-sm text-foreground/80 mb-3 italic">
                        "{request.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(request.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(request.id, 'accepted')}
                    disabled={responding === request.id}
                    className="flex-1 gap-2"
                  >
                    {responding === request.id ? (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(request.id, 'declined')}
                    disabled={responding === request.id}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-3 h-3" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {/* Other requests */}
            {otherRequests.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <h5 className="text-sm font-medium text-muted-foreground mb-3">Previous Requests</h5>
                <div className="space-y-3">
                  {otherRequests.map((request) => {
                    const interviewResult = interviewResults.get(request.id);
                    const isCompleted = request.status === 'completed';
                    const isPassed = interviewResult?.passed;
                    
                    return (
                      <div
                        key={request.id}
                        className={cn(
                          'p-3 rounded-lg border bg-background/50',
                          request.status === 'accepted' && !isCompleted
                            ? 'border-verdict-interview/30'
                            : isCompleted && isPassed
                            ? 'border-green-500/30'
                            : isCompleted && !isPassed
                            ? 'border-red-500/30'
                            : 'border-border/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground">
                                {request.company?.name || request.company?.analyzed_data?.name || 'Company'}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  isCompleted && isPassed
                                    ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                    : isCompleted && !isPassed
                                    ? 'border-red-500/30 text-red-500 bg-red-500/10'
                                    : request.status === 'accepted'
                                    ? 'border-verdict-interview/30 text-verdict-interview'
                                    : 'border-border text-muted-foreground'
                                )}
                              >
                                {isCompleted
                                  ? isPassed
                                    ? 'Passed'
                                    : 'Failed'
                                  : request.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Declined'}
                              </Badge>
                            </div>
                            {request.job_posting && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {request.job_posting.title}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {request.responded_at
                              ? new Date(request.responded_at).toLocaleDateString()
                              : new Date(request.requested_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
