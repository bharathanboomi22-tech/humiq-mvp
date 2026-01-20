import { Link2, Github, Linkedin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TalentOnboardingData } from '@/types/discovery';

interface LinksStepProps {
  data: TalentOnboardingData;
  updateField: <K extends keyof TalentOnboardingData>(field: K, value: TalentOnboardingData[K]) => void;
}

export function LinksStep({ data, updateField }: LinksStepProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mx-auto mb-4">
          <Link2 className="w-7 h-7 text-accent" />
        </div>
        <CardTitle className="text-2xl">Your Work</CardTitle>
        <CardDescription>
          Share links to your work (all optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GitHub */}
        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-2">
            <Github className="w-4 h-4 text-muted-foreground" />
            GitHub Profile
          </Label>
          <Input
            id="github"
            placeholder="https://github.com/username"
            value={data.githubUrl}
            onChange={(e) => updateField('githubUrl', e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-muted-foreground" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/username"
            value={data.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* Portfolio */}
        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Portfolio / Website
          </Label>
          <Input
            id="portfolio"
            placeholder="https://yoursite.com"
            value={data.portfolioUrl}
            onChange={(e) => updateField('portfolioUrl', e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* Other Links */}
        <div className="space-y-2">
          <Label htmlFor="other" className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            Other Links
          </Label>
          <Textarea
            id="other"
            placeholder="Any other links to your work (blog posts, projects, talks, etc.)"
            value={data.otherLinks}
            onChange={(e) => updateField('otherLinks', e.target.value)}
            className="bg-background/50 min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            One link per line or comma-separated
          </p>
        </div>

        {/* Encouragement message */}
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <p className="text-sm text-foreground/80">
            <strong className="text-accent">Tip:</strong> Even if you don't have public links, 
            you can still complete your profile through our AI discovery conversation 
            where you'll tell us about your experience in your own words.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
