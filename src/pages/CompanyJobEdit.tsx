import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { getJobPosting, updateJob, toggleJobActive, deleteJob } from '@/lib/company';
import { JobPosting } from '@/types/company';

const CompanyJobEdit = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        navigate('/company/dashboard');
        return;
      }

      try {
        const jobData = await getJobPosting(jobId);
        if (!jobData) {
          toast.error('Job not found');
          navigate('/company/dashboard');
          return;
        }

        setJob(jobData);
        setTitle(jobData.title);
        setDescription(jobData.description);
        setRequirements(jobData.requirements || '');
        setIsActive(jobData.is_active);
      } catch (error) {
        console.error('Error loading job:', error);
        toast.error('Failed to load job');
        navigate('/company/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId || !title.trim() || !description.trim()) {
      toast.error('Please fill in the job title and description');
      return;
    }

    setIsSaving(true);

    try {
      await updateJob(jobId, {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
      });

      // Update active status if changed
      if (job && job.is_active !== isActive) {
        await toggleJobActive(jobId, isActive);
      }

      toast.success('Job updated successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update job');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;
    
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteJob(jobId);
      toast.success('Job deleted successfully');
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient">
        <Navigation variant="company" showBack />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient">
      <Navigation variant="company" showBack />
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
              Edit Job Posting
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Update the details for this position.
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
                Note: Changes to title/description won't re-analyze the job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                  <div>
                    <Label className="text-foreground">Job Status</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isActive ? 'Visible to candidates' : 'Hidden from candidates'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={isSaving}
                    />
                  </div>
                </div>

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
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 min-h-[180px]"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-foreground flex items-center gap-2">
                    Requirements & Nice-to-Haves
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="List specific technical requirements and nice-to-have skills..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="bg-background/50 min-h-[120px]"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSaving || isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    disabled={isSaving || isDeleting || !title.trim() || !description.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default CompanyJobEdit;
