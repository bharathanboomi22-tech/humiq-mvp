import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Clock, CheckCircle, XCircle, Mail } from 'lucide-react';
import { getInterviewRequests, respondToInterviewRequest } from '@/lib/interviews';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface InterviewRequest {
  id: string;
  company_id: string;
  job_posting_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string | null;
  requested_at: string;
  responded_at: string | null;
  company?: {
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
  const [isLoading, setIsLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getInterviewRequests(talentId);
        setRequests(data);
      } catch (error) {
        console.error('Error loading interview requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [talentId]);

  const handleRespond = async (requestId: string, status: 'accepted' | 'declined') => {
    setResponding(requestId);
    try {
      await respondToInterviewRequest(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, responded_at: new Date().toISOString() } : r))
      );
      toast.success(status === 'accepted' ? 'Interview request accepted!' : 'Interview request declined');
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
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
                        {request.company?.analyzed_data?.name || 'Company'}
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
                  {otherRequests.map((request) => (
                    <div
                      key={request.id}
                      className={cn(
                        'p-3 rounded-lg border bg-background/50',
                        request.status === 'accepted'
                          ? 'border-verdict-interview/30'
                          : 'border-border/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground">
                              {request.company?.analyzed_data?.name || 'Company'}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                request.status === 'accepted'
                                  ? 'border-verdict-interview/30 text-verdict-interview'
                                  : 'border-border text-muted-foreground'
                              )}
                            >
                              {request.status === 'accepted' ? 'Accepted' : 'Declined'}
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
