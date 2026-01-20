import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getInterviewResult, InterviewResult } from '@/lib/interviews';
import { cn } from '@/lib/utils';

const InterviewResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      if (!id) {
        toast.error('Result ID is required');
        navigate('/talent/dashboard');
        return;
      }

      try {
        const data = await getInterviewResult(id);
        if (!data) {
          toast.error('Interview result not found');
          navigate('/talent/dashboard');
          return;
        }
        setResult(data);
      } catch (error) {
        console.error('Error loading interview result:', error);
        toast.error('Failed to load interview result');
        navigate('/talent/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient">
        <Navigation variant="talent" />
        <div className="container max-w-2xl mx-auto px-6 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  if (!result) {
    return null;
  }

  const { passed, talent_recap, interview_request } = result;
  const jobTitle = interview_request?.job_posting?.title || 'the position';
  const companyName = interview_request?.company?.name || interview_request?.company?.analyzed_data?.name || 'the company';

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="talent" />
      <div className="container max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className={cn(
              'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
              passed ? 'bg-green-500/10' : 'bg-red-500/10'
            )}>
              {passed ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
              Interview {passed ? 'Passed' : 'Failed'}
            </h1>
            <p className="text-muted-foreground">
              {jobTitle} at {companyName}
            </p>
          </div>

          {/* Summary Card */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {talent_recap.summary}
              </p>
            </CardContent>
          </Card>

          {/* Strengths */}
          {talent_recap.strengths && talent_recap.strengths.length > 0 && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {talent_recap.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Areas to Improve / Why you didn't pass */}
          {talent_recap.areasToImprove && talent_recap.areasToImprove.length > 0 && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className={cn('w-5 h-5', passed ? 'text-yellow-500' : 'text-red-500')} />
                  {passed ? 'Areas to Improve' : 'Why You Didn\'t Pass'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {talent_recap.areasToImprove.map((area, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', passed ? 'text-yellow-500' : 'text-red-500')} />
                      <span className="text-foreground">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Advice */}
          {talent_recap.advice && (
            <Card className="glass-card mb-6 border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg">Advice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {talent_recap.advice}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {talent_recap.nextSteps && (
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {talent_recap.nextSteps}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/talent/dashboard')}
              size="lg"
              className="gap-2"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default InterviewResultPage;
