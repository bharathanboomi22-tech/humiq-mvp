import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getStoredTalentId, setStoredTalentId, analyzeGitHubForOnboarding } from '@/lib/talent';
import { Json } from '@/integrations/supabase/types';

export interface WorkContextEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface WorkLink {
  type: 'github' | 'portfolio' | 'other';
  url: string;
  label?: string;
}

export interface OnboardingData {
  fullName: string;
  email: string;
  location: string;
  timezone: string;
  languages: string[];
  availabilityStatus: 'open' | 'exploring' | 'not_open';
  primaryRole: string;
  experienceRange: string;
  workContext: WorkContextEntry[];
  workLinks: WorkLink[];
  howIWork: string;
  profileVisibility: 'public' | 'private';
  allowProofRequests: boolean;
}

const initialData: OnboardingData = {
  fullName: '',
  email: '',
  location: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  languages: [],
  availabilityStatus: 'open',
  primaryRole: '',
  experienceRange: '',
  workContext: [],
  workLinks: [],
  howIWork: '',
  profileVisibility: 'public',
  allowProofRequests: true,
};

export const useTalentOnboarding = () => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      const talentId = getStoredTalentId();
      if (!talentId) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', talentId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profile) {
          const consolidatedProfile = profile.consolidated_profile as Record<string, unknown> | null;
          const workContext = profile.work_context as unknown as WorkContextEntry[] | null;
          const workLinks = profile.work_links as unknown as WorkLink[] | null;
          
          setData({
            fullName: profile.name || '',
            email: profile.email || '',
            location: profile.location || '',
            timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            languages: profile.languages || [],
            availabilityStatus: (profile.availability_status as OnboardingData['availabilityStatus']) || 'open',
            primaryRole: (consolidatedProfile?.primaryRole as string) || '',
            experienceRange: (consolidatedProfile?.experienceRange as string) || '',
            workContext: workContext || [],
            workLinks: workLinks || [],
            howIWork: profile.how_i_work || '',
            profileVisibility: (profile.profile_visibility as OnboardingData['profileVisibility']) || 'public',
            allowProofRequests: profile.allow_proof_requests ?? true,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateField = <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProgress = async (): Promise<boolean> => {
    setSaving(true);

    try {
      let talentId = getStoredTalentId();
      const githubUrl = data.workLinks.find(l => l.type === 'github')?.url || null;
      
      // Create profile if it doesn't exist
      if (!talentId) {
        const { data: newProfile, error: createError } = await supabase
          .from('talent_profiles')
          .insert({
            github_url: githubUrl,
            name: data.fullName,
            email: data.email,
            location: data.location,
            timezone: data.timezone,
            languages: data.languages,
            availability_status: data.availabilityStatus,
            work_context: data.workContext as unknown as Json,
            work_links: data.workLinks as unknown as Json,
            how_i_work: data.howIWork,
            profile_visibility: data.profileVisibility,
            allow_proof_requests: data.allowProofRequests,
            consolidated_profile: {
              primaryRole: data.primaryRole,
              experienceRange: data.experienceRange,
            } as unknown as Json,
          })
          .select()
          .single();

        if (createError) throw createError;
        
        talentId = newProfile.id;
        setStoredTalentId(talentId);
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('talent_profiles')
          .update({
            github_url: githubUrl,
            name: data.fullName,
            email: data.email,
            location: data.location,
            timezone: data.timezone,
            languages: data.languages,
            availability_status: data.availabilityStatus,
            work_context: data.workContext as unknown as Json,
            work_links: data.workLinks as unknown as Json,
            how_i_work: data.howIWork,
            profile_visibility: data.profileVisibility,
            allow_proof_requests: data.allowProofRequests,
            consolidated_profile: {
              primaryRole: data.primaryRole,
              experienceRange: data.experienceRange,
            } as unknown as Json,
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', talentId);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error: unknown) {
      console.error('Error saving onboarding:', error);
      const message = error instanceof Error ? error.message : 'Failed to save progress';
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const completeOnboarding = async (): Promise<boolean> => {
    const saved = await saveProgress();
    if (!saved) return false;

    const talentId = getStoredTalentId();
    if (!talentId) return false;

    setSaving(true);

    try {
      // Mark onboarding as completed
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          onboarding_completed: true,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', talentId);

      if (error) throw error;

      // Check if we have a GitHub URL to analyze
      const githubUrl = data.workLinks.find(l => l.type === 'github')?.url;
      if (githubUrl) {
        setAnalyzing(true);
        setSaving(false);
        
        // Run GitHub analysis in background (will update profile)
        await analyzeGitHubForOnboarding(talentId, githubUrl);
        
        setAnalyzing(false);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error completing onboarding:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
      setAnalyzing(false);
    }
  };

  const nextStep = async () => {
    const saved = await saveProgress();
    if (saved) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return {
    data,
    updateField,
    currentStep,
    setCurrentStep: goToStep,
    nextStep,
    prevStep,
    saveProgress,
    completeOnboarding,
    loading,
    saving,
    analyzing,
  };
};
