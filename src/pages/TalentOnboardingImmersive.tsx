import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  ImmersiveOnboardingLayout,
  ChatInterface,
  ChipSelector,
  CVUploadCard,
  CVReviewCard,
  AddEvidenceCard,
} from '@/components/talent-onboarding';
import { useImmersiveOnboarding } from '@/hooks/useImmersiveOnboarding';
import { getStoredTalentId, getTalentProfile } from '@/lib/talent';
import type { TalentIntent } from '@/components/talent-onboarding/types';

// Layer 1 options
const AVAILABILITY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'in-1-3-months', label: 'In 1–3 months' },
  { value: 'in-3-6-months', label: 'In 3–6 months' },
  { value: 'exploring', label: 'Just exploring right now' },
];

const WORK_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'fractional', label: 'Fractional' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'open', label: 'Open to discussing' },
];

const WORK_STYLE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
  { value: 'flexible', label: 'Flexible' },
];

const TalentOnboardingImmersive = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);

  const {
    state,
    messages,
    cvEntries,
    setCvEntries,
    profileDraft,
    isTyping,
    isParsingCV,
    isTransitioning,
    handleWelcome,
    goToCvUpload,
    handleCvUpload,
    skipCv,
    handleCvReviewComplete,
    handleAvailabilitySelected,
    handleWorkTypesSelected,
    handleWorkStyleSelected,
    handleAnchorResponse,
    handlePrioritizationResponse,
    handleJudgmentResponse,
    handleReflectionResponse,
    handleSelfInsightResponse,
    handleConfirmInterpretation,
    handleTweakInterpretation,
    handleTweakResponse,
    skipEvidence,
    addEvidence,
    goToComplete,
    removeTrait,
    removeExperience,
    removeEducation,
    toggleAnonymous,
    addAssistantMessage,
  } = useImmersiveOnboarding();

  // Check onboarding status
  useEffect(() => {
    const checkStatus = async () => {
      const talentId = getStoredTalentId();
      if (!talentId) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getTalentProfile(talentId);
        if (profile?.onboarding_completed) {
          navigate('/talent/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
      setIsLoading(false);
    };

    checkStatus();
  }, [navigate]);

  // Initialize welcome message
  useEffect(() => {
    if (!isLoading && state === 'welcome' && messages.length === 0) {
      handleWelcome();
    }
  }, [isLoading, state, messages.length, handleWelcome]);

  // Handle profile confirmation and navigation
  const handleComplete = (openToConvo: boolean) => {
    if (openToConvo) {
      // TODO: Update profile with openToConversations status
    }
    navigate('/talent/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  // Get the current message handler based on state
  const getMessageHandler = () => {
    switch (state) {
      case 'decision-anchor':
        return handleAnchorResponse;
      case 'decision-prioritization':
        return handlePrioritizationResponse;
      case 'decision-judgment':
        return handleJudgmentResponse;
      case 'decision-reflection':
        return handleReflectionResponse;
      case 'decision-self-insight':
        return handleSelfInsightResponse;
      case 'decision-interpretation':
        // If user is tweaking
        return handleTweakResponse;
      default:
        return () => {};
    }
  };

  // Build quick actions based on state (attached to latest assistant message)
  const getQuickActions = () => {
    switch (state) {
      case 'welcome':
        return messages.length > 0 ? [
          { label: 'Start here...', variant: 'primary' as const, onClick: goToCvUpload }
        ] : [];

      case 'decision-interpretation':
        return [
          { label: 'Yes, looks right', variant: 'primary' as const, onClick: handleConfirmInterpretation },
          { label: 'I want to tweak this', variant: 'secondary' as const, onClick: handleTweakInterpretation }
        ];

      case 'evidence':
        return [];  // Using AddEvidenceCard instead

      case 'complete':
        return [
          { label: 'Open to conversations', variant: 'primary' as const, onClick: () => handleComplete(true) },
          { label: 'Stay private for now', variant: 'secondary' as const, onClick: () => handleComplete(false) }
        ];

      default:
        return [];
    }
  };

  // Build helper actions
  const getHelperActions = () => {
    const decisionStates = ['decision-anchor', 'decision-prioritization', 'decision-judgment', 'decision-reflection', 'decision-self-insight'];
    if (decisionStates.includes(state)) {
      return [
        { label: 'Not sure', onClick: () => getMessageHandler()("I'm not sure about this one.") },
        { label: 'Make it simpler', onClick: () => addAssistantMessage("Let me rephrase that in a simpler way.", 500) },
      ];
    }
    return [];
  };

  // Render state-specific content
  const renderStateContent = () => {
    switch (state) {
      case 'cv-upload':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <CVUploadCard 
              onUpload={handleCvUpload}
              onSkip={skipCv}
              isLoading={isParsingCV}
            />
          </motion.div>
        );

      case 'cv-review':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <CVReviewCard
              entries={cvEntries}
              onEdit={(id) => console.log('Edit', id)}
              onRemove={(id) => setCvEntries(prev => prev.filter(e => e.id !== id))}
              onContinue={handleCvReviewComplete}
            />
          </motion.div>
        );

      // Layer 1: Intent & Constraints
      case 'intent-availability':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-4"
          >
            <ChipSelector
              options={AVAILABILITY_OPTIONS.map(o => o.label)}
              selected={[]}
              onChange={(selected) => {
                const option = AVAILABILITY_OPTIONS.find(o => o.label === selected[0]);
                if (option) {
                  handleAvailabilitySelected(option.value as TalentIntent['availability']);
                }
              }}
              multiSelect={false}
            />
            <p className="text-xs text-muted-foreground/60 px-1">
              This doesn't commit you to anything. It just sets expectations.
            </p>
          </motion.div>
        );

      case 'intent-work-types':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-4"
          >
            <ChipSelector
              options={WORK_TYPE_OPTIONS.map(o => o.label)}
              selected={selectedWorkTypes}
              onChange={(selected) => setSelectedWorkTypes(selected)}
              multiSelect={true}
            />
            {selectedWorkTypes.length > 0 && (
              <button
                onClick={() => {
                  const values = selectedWorkTypes.map(label => 
                    WORK_TYPE_OPTIONS.find(o => o.label === label)?.value
                  ).filter(Boolean) as TalentIntent['workTypes'];
                  handleWorkTypesSelected(values);
                }}
                className="btn-primary text-sm"
              >
                Continue
              </button>
            )}
            <p className="text-xs text-muted-foreground/60 px-1">
              You can change this anytime.
            </p>
          </motion.div>
        );

      case 'intent-work-style':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-4"
          >
            <ChipSelector
              options={WORK_STYLE_OPTIONS.map(o => o.label)}
              selected={[]}
              onChange={(selected) => {
                const option = WORK_STYLE_OPTIONS.find(o => o.label === selected[0]);
                if (option) {
                  handleWorkStyleSelected(option.value as TalentIntent['workStyle']);
                }
              }}
              multiSelect={false}
            />
          </motion.div>
        );

      // Transition state
      case 'transition':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 flex items-center justify-center"
          >
            <div 
              className="w-16 h-16 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, hsla(168, 80%, 50%, 0.4) 0%, hsla(145, 70%, 45%, 0.2) 50%, transparent 70%)',
                boxShadow: '0 0 40px hsla(168, 80%, 50%, 0.3)',
              }}
            />
          </motion.div>
        );

      // Evidence collection
      case 'evidence':
        return (
          <AddEvidenceCard
            onAddLink={(url) => addEvidence({ type: 'link', name: url, description: '', decision: '' })}
            onAddFile={(file) => addEvidence({ type: 'file', name: file.name, description: '', decision: '' })}
            onSkip={skipEvidence}
          />
        );

      default:
        return null;
    }
  };

  // Determine if we should show the standard input
  const isInputEnabled = [
    'decision-anchor',
    'decision-prioritization', 
    'decision-judgment',
    'decision-reflection',
    'decision-self-insight',
    'decision-interpretation',
  ].includes(state);

  // Show profile glow during interpretation/confirmation states
  const showProfileGlow = state === 'decision-interpretation' || isTransitioning;

  return (
    <ImmersiveOnboardingLayout
      profileDraft={profileDraft}
      showProfileGlow={showProfileGlow}
      onRemoveExperience={removeExperience}
      onRemoveEducation={removeEducation}
      onRemoveTrait={removeTrait}
      onToggleAnonymous={toggleAnonymous}
    >
      <ChatInterface
        messages={messages}
        onSendMessage={getMessageHandler()}
        isTyping={isTyping}
        quickActions={getQuickActions()}
        helperActions={getHelperActions()}
        showInput={true}
        inputDisabled={!isInputEnabled}
        placeholder="Share your thoughts..."
        belowMessagesContent={renderStateContent()}
      />
    </ImmersiveOnboardingLayout>
  );
};

export default TalentOnboardingImmersive;
