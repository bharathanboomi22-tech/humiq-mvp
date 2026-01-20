import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getStoredTalentId, setStoredTalentId } from '@/lib/talent';

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
          setData({
            fullName: profile.name || '',
            email: profile.email || '',
            location: profile.location || '',
            timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            languages: profile.languages || [],
            availabilityStatus: profile.availability_status || 'open',
            primaryRole: profile.consolidated_profile?.primaryRole || '',
            experienceRange: profile.consolidated_profile?.experienceRange || '',
            workContext: profile.work_context || [],
            workLinks: profile.work_links || [],
            howIWork: profile.how_i_work || '',
            profileVisibility: profile.profile_visibility || 'public',
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
      
      // Create profile if it doesn't exist
      if (!talentId) {
        const githubUrl = data.workLinks.find(l => l.type === 'github')?.url || null;
        
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
            work_context: data.workContext,
            work_links: data.workLinks,
            how_i_work: data.howIWork,
            profile_visibility: data.profileVisibility,
            allow_proof_requests: data.allowProofRequests,
            consolidated_profile: {
              primaryRole: data.primaryRole,
              experienceRange: data.experienceRange,
            },
          })
          .select()
          .single();

        if (createError) throw createError;
        
        talentId = newProfile.id;
        setStoredTalentId(talentId);
      } else {
        // Update existing profile
        const githubUrl = data.workLinks.find(l => l.type === 'github')?.url || null;
        
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
            work_context: data.workContext,
            work_links: data.workLinks,
            how_i_work: data.howIWork,
            profile_visibility: data.profileVisibility,
            allow_proof_requests: data.allowProofRequests,
            consolidated_profile: {
              primaryRole: data.primaryRole,
              experienceRange: data.experienceRange,
            },
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', talentId);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error: any) {
      console.error('Error saving onboarding:', error);
      toast.error(error.message || 'Failed to save progress');
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
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          onboarding_completed: true,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', talentId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Failed to complete onboarding');
      return false;
    } finally {
      setSaving(false);
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
  };
};
