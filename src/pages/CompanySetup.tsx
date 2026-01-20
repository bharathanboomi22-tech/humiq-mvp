import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Globe, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { analyzeCompany, setStoredCompanyId } from '@/lib/company';

const CompanySetup = () => {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl.trim()) {
      toast.error('Please enter your company website URL');
      return;
    }

    setIsLoading(true);

    try {
      const company = await analyzeCompany({
        websiteUrl: websiteUrl.trim(),
        description: description.trim() || undefined,
      });

      setStoredCompanyId(company.id);
      toast.success('Company profile created successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze company');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ambient">
      <div className="container max-w-2xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Set Up Your Company
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Tell us about your company so we can match you with the best engineering talent.
            </p>
          </div>

          {/* Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Company Information
              </CardTitle>
              <CardDescription>
                Our AI will analyze your website to understand your company better.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">
                    Company Website <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-background/50"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll analyze your website to understand your tech stack, culture, and values.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Additional Description
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us more about your company, what you're building, and what makes your team unique..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 min-h-[120px]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us create a more accurate profile for matching.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isLoading || !websiteUrl.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing your company...
                    </>
                  ) : (
                    <>
                      Create Company Profile
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Back link */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default CompanySetup;
