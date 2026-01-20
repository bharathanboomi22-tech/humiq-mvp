import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { analyzeJob, getStoredCompanyId } from '@/lib/company';
import { runMatchingForJob } from '@/lib/matching';

const CompanyJobNew = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const companyId = getStoredCompanyId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      toast.error('Please set up your company first');
      navigate('/company/setup');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in the job title and description');
      return;
    }

    setIsLoading(true);

    try {
      const jobPosting = await analyzeJob({
        companyId,
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
      });

      // Run matching for this new job
      await runMatchingForJob(jobPosting.id);

      toast.success('Job posted and analyzed successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create job posting');
    } finally {
      setIsLoading(false);
    }
  };

  if (!companyId) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Card className="glass-card max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Company Not Set Up</h2>
            <p className="text-muted-foreground mb-4">
              Please set up your company profile before posting jobs.
            </p>
            <Button onClick={() => navigate('/company/setup')}>Set Up Company</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="company" />
      <div className="container max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
              <Briefcase className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Post a New Job
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Our AI will analyze your job posting to match you with the best candidates.
            </p>
          </div>

          {/* Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Job Details
              </CardTitle>
              <CardDescription>
                Describe the role and requirements clearly for better matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Senior Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, what you're looking for in a candidate, and what makes this opportunity exciting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 min-h-[180px]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about the day-to-day work and impact of this role.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-foreground flex items-center gap-2">
                    Requirements & Nice-to-Haves
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="List specific technical requirements, experience levels, and nice-to-have skills..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="bg-background/50 min-h-[120px]"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isLoading || !title.trim() || !description.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing and posting...
                    </>
                  ) : (
                    <>
                      Analyze & Post Job
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default CompanyJobNew;
