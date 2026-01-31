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
} from '@/components/talent-onboarding';
import { useImmersiveOnboarding } from '@/hooks/useImmersiveOnboarding';
import { getStoredTalentId, getTalentProfile } from '@/lib/talent';

const ROLE_OPTIONS = ['Product', 'Design', 'Engineering', 'Data', 'Operations', 'Leadership', 'Something else'];
const PROBLEM_OPTIONS = ['Ambiguous problems', 'Scaling systems', 'Deep craft work', 'Leading people', 'Fixing what\'s broken'];

const TalentOnboardingImmersive = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [rolesConfirmed, setRolesConfirmed] = useState(false);
  const [problemsConfirmed, setProblemsConfirmed] = useState(false);

  const {
    state,
    messages,
    cvEntries,
    setCvEntries,
    selectedRoles,
    selectedProblems,
    profileDraft,
    isTyping,
    isParsingCV,
    handleWelcome,
    goToCvUpload,
    handleCvUpload,
    skipCv,
    handleCvReviewComplete,
    handleRolesSelected,
    handleProblemsSelected,
    startSimulation,
    handleSimulationResponse,
    skipEvidence,
    addEvidence,
    confirmProfile,
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

  // Build quick actions based on state
  const getQuickActions = () => {
    switch (state) {
      case 'welcome':
        return messages.length > 0 ? [
          { label: 'Start here...', variant: 'primary' as const, onClick: goToCvUpload }
        ] : [];

      case 'simulation-intro':
        return [
          { label: 'Continue', variant: 'primary' as const, onClick: startSimulation }
        ];

      case 'evidence':
        return [
          { label: 'Add a file or link', variant: 'primary' as const, onClick: () => {
            // TODO: Open file/link modal
            addEvidence({ type: 'link', name: 'Sample Project', description: 'Built a dashboard', decision: 'Owned architecture' });
          }},
          { label: 'I\'ll add this later', variant: 'secondary' as const, onClick: skipEvidence }
        ];

      case 'confirmation':
        return [
          { label: 'Yes, looks right', variant: 'primary' as const, onClick: confirmProfile },
          { label: 'I want to tweak this', variant: 'secondary' as const, onClick: () => {
            // Profile panel allows editing
          }}
        ];

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
    if (state === 'simulation') {
      return [
        { label: 'Not sure', onClick: () => handleSimulationResponse("I'm not sure about this one.") },
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
            className="px-8 py-4"
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
            className="px-8 py-4"
          >
            <CVReviewCard
              entries={cvEntries}
              onEdit={(id) => console.log('Edit', id)}
              onRemove={(id) => setCvEntries(prev => prev.filter(e => e.id !== id))}
              onContinue={handleCvReviewComplete}
            />
          </motion.div>
        );

      case 'exploration':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-8 py-4 space-y-6"
          >
            {!rolesConfirmed && (
              <div className="space-y-4">
                <ChipSelector
                  options={ROLE_OPTIONS}
                  selected={selectedRoles}
                  onChange={(roles) => handleRolesSelected(roles)}
                  multiSelect={false}
                />
                {selectedRoles.length > 0 && (
                  <button
                    onClick={() => setRolesConfirmed(true)}
                    className="btn-primary text-sm"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            {rolesConfirmed && !problemsConfirmed && (
              <div className="space-y-4">
                <ChipSelector
                  options={PROBLEM_OPTIONS}
                  selected={selectedProblems}
                  onChange={(problems) => handleProblemsSelected(problems)}
                  multiSelect={true}
                />
                {selectedProblems.length > 0 && (
                  <button
                    onClick={() => setProblemsConfirmed(true)}
                    className="btn-primary text-sm"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Determine if we should show the standard input
  const showInput = state === 'simulation';

  return (
    <ImmersiveOnboardingLayout
      profileDraft={profileDraft}
      showProfileGlow={state === 'confirmation'}
      onRemoveExperience={removeExperience}
      onRemoveEducation={removeEducation}
      onRemoveTrait={removeTrait}
      onToggleAnonymous={toggleAnonymous}
    >
      <ChatInterface
        messages={messages}
        onSendMessage={handleSimulationResponse}
        isTyping={isTyping}
        quickActions={getQuickActions()}
        helperActions={getHelperActions()}
        showInput={showInput}
        placeholder="Share your thoughts..."
      />
      {renderStateContent()}
    </ImmersiveOnboardingLayout>
  );
};

export default TalentOnboardingImmersive;
