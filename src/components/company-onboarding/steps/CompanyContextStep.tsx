import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';

interface CompanyContextStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
  isAnalyzing: boolean;
  onContinue: () => void;
}

export const CompanyContextStep = ({
  companyName,
  setCompanyName,
  websiteUrl,
  setWebsiteUrl,
  isAnalyzing,
  onContinue,
}: CompanyContextStepProps) => {
  const isValid = companyName.trim().length > 0 && websiteUrl.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-xl mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4"
        >
          Understand your company context
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          HumiQ uses public signals to understand your company's domain, team style, and operating context.
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-foreground font-medium">
            Company Name
          </Label>
          <Input
            id="company-name"
            type="text"
            placeholder="Your company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isAnalyzing}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-foreground font-medium">
            Company Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yourcompany.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isAnalyzing}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground pt-1">
            We'll analyze your website to understand what you're building and how your team operates.
          </p>
        </div>

        {/* AI Analysis Indicator */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[#5B8CFF]/5 border border-[#5B8CFF]/10"
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full cognitive-gradient animate-pulse" />
            </div>
            <span className="text-sm text-foreground/70">Understanding your company…</span>
          </motion.div>
        )}

        <Button
          onClick={onContinue}
          disabled={!isValid || isAnalyzing}
          size="lg"
          className="w-full gap-2 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
