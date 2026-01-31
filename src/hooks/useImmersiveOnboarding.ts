import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  OnboardingState, 
  ChatMessage, 
  ProfileDraft, 
  CVEntry,
  CVParseResult,
  ExperienceEntry,
  EducationEntry,
  ValidationResult,
  TalentIntent,
  DecisionTrace,
} from '@/components/talent-onboarding/types';

const generateId = () => Math.random().toString(36).slice(2, 11);

const INITIAL_INTENT: TalentIntent = {
  availability: null,
  workTypes: [],
  workStyle: null,
  locationConstraints: null,
};

const INITIAL_DECISION_TRACE: DecisionTrace = {
  scenario: {
    contextSummary: null,
    constraintsSummary: null,
    prioritizationResponse: null,
    judgmentResponse: null,
    reflectionResponse: null,
    selfInsightResponse: null,
  },
  interpretation: null,
  userConfirmed: false,
};

const INITIAL_PROFILE_DRAFT: ProfileDraft = {
  basicDetails: {
    fullName: null,
    location: null,
    email: null,
    contactNumber: null,
  },
  experience: [],
  education: [],
  workStyle: [
    { id: 'approach', title: 'Problem framing', traits: [], isDraft: true },
    { id: 'decisions', title: 'Tradeoff thinking', traits: [], isDraft: true },
    { id: 'collaboration', title: 'Adaptability', traits: [], isDraft: true },
    { id: 'environment', title: 'Reflection', traits: [], isDraft: true },
  ],
  evidence: [],
  isAnonymous: true,
  intent: INITIAL_INTENT,
  decisionTrace: INITIAL_DECISION_TRACE,
};

// Input validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;
const GARBAGE_PATTERNS = /^(asdf|qwer|zxcv|idk|whatever|lol|test|123|abc|xxx)/i;

// Validate user input
const validateInput = (input: string, context: 'general' | 'email' | 'phone' | 'name'): ValidationResult => {
  const trimmed = input.trim();
  
  if (!trimmed || trimmed.length < 2) {
    return { isValid: false, message: "That doesn't look like a complete answer yet. Could you add more detail?" };
  }

  if (GARBAGE_PATTERNS.test(trimmed)) {
    return { isValid: false, message: "I might be misunderstanding. Can you rephrase that?" };
  }

  if (context === 'email' && !EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: "That doesn't look like a valid email address. Could you check it?" };
  }

  if (context === 'phone' && !PHONE_REGEX.test(trimmed)) {
    return { isValid: false, message: "That doesn't look like a valid phone number. Could you update it?" };
  }

  if (context === 'name' && trimmed.length < 2) {
    return { isValid: false, message: "Could you provide your full name?" };
  }

  return { isValid: true };
};

export const useImmersiveOnboarding = () => {
  const [state, setState] = useState<OnboardingState>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cvEntries, setCvEntries] = useState<CVEntry[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(INITIAL_PROFILE_DRAFT);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [openToConversations, setOpenToConversations] = useState(true);
  const [isParsingCV, setIsParsingCV] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add assistant message with typing effect
  const addAssistantMessage = useCallback((content: string, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: generateId(), role: 'assistant', content, timestamp: new Date() }
      ]);
      setIsTyping(false);
    }, delay);
  }, []);

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'user', content, timestamp: new Date() }
    ]);
  }, []);

  // Update basic details
  const updateBasicDetails = useCallback((field: keyof ProfileDraft['basicDetails'], value: string | null) => {
    setProfileDraft(prev => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        [field]: value,
      },
    }));
  }, []);

  // Update intent (Layer 1)
  const updateIntent = useCallback((field: keyof TalentIntent, value: TalentIntent[keyof TalentIntent]) => {
    setProfileDraft(prev => ({
      ...prev,
      intent: {
        ...prev.intent!,
        [field]: value,
      },
    }));
  }, []);

  // Update decision trace (Layer 2)
  const updateDecisionScenario = useCallback((field: keyof typeof INITIAL_DECISION_TRACE.scenario, value: string | null) => {
    setProfileDraft(prev => ({
      ...prev,
      decisionTrace: {
        ...prev.decisionTrace!,
        scenario: {
          ...prev.decisionTrace!.scenario,
          [field]: value,
        },
      },
    }));
  }, []);

  const setInterpretation = useCallback((interpretation: string) => {
    setProfileDraft(prev => ({
      ...prev,
      decisionTrace: {
        ...prev.decisionTrace!,
        interpretation,
      },
    }));
  }, []);

  const confirmInterpretation = useCallback(() => {
    setProfileDraft(prev => ({
      ...prev,
      decisionTrace: {
        ...prev.decisionTrace!,
        userConfirmed: true,
      },
    }));
  }, []);

  // Add experience entry
  const addExperience = useCallback((entry: Omit<ExperienceEntry, 'id'>) => {
    setProfileDraft(prev => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), ...entry }],
    }));
  }, []);

  // Remove experience entry
  const removeExperience = useCallback((id: string) => {
    setProfileDraft(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id),
    }));
  }, []);

  // Add education entry
  const addEducation = useCallback((entry: Omit<EducationEntry, 'id'>) => {
    setProfileDraft(prev => ({
      ...prev,
      education: [...prev.education, { id: generateId(), ...entry }],
    }));
  }, []);

  // Remove education entry
  const removeEducation = useCallback((id: string) => {
    setProfileDraft(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id),
    }));
  }, []);

  // Add trait to work style
  const addTrait = useCallback((sectionId: string, text: string) => {
    setProfileDraft(prev => ({
      ...prev,
      workStyle: prev.workStyle.map(section =>
        section.id === sectionId
          ? { ...section, traits: [...section.traits, { id: generateId(), text, isNew: true }] }
          : section
      ),
    }));
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setProfileDraft(prev => ({
        ...prev,
        workStyle: prev.workStyle.map(section =>
          section.id === sectionId
            ? { ...section, traits: section.traits.map(t => ({ ...t, isNew: false })) }
            : section
        ),
      }));
    }, 1500);
  }, []);

  // Remove trait
  const removeTrait = useCallback((sectionId: string, traitIndex: number) => {
    setProfileDraft(prev => ({
      ...prev,
      workStyle: prev.workStyle.map(section =>
        section.id === sectionId
          ? { ...section, traits: section.traits.filter((_, i) => i !== traitIndex) }
          : section
      ),
    }));
  }, []);

  // Validate and process user input
  const processUserInput = useCallback((input: string, context: 'general' | 'email' | 'phone' | 'name' = 'general'): ValidationResult => {
    return validateInput(input, context);
  }, []);

  // ========================================
  // STATE 0: Welcome & CV
  // ========================================

  const handleWelcome = useCallback(() => {
    addAssistantMessage(
      "Welcome.\n\nThis is where your hiring profile gets built — without applications, skills lists, or rankings.\n\nWe'll do this through a short conversation about how you think and work.\n\nTakes about 10 minutes. You can skip anything."
    );
  }, [addAssistantMessage]);

  const goToCvUpload = useCallback(() => {
    setState('cv-upload');
    addAssistantMessage(
      "If you have a CV handy, you can upload it here.\n\nThis is the last time you'll ever need one.\n\nI'll only use it to understand your work and education timeline — not to judge you.",
      1000
    );
  }, [addAssistantMessage]);

  // Handle CV upload with AI parsing
  const handleCvUpload = useCallback(async (file: File) => {
    setIsParsingCV(true);
    addAssistantMessage("Parsing your CV...", 500);

    try {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('parse-cv', {
        body: { 
          fileContent,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      const parsedData = data as CVParseResult;

      if (parsedData.basic_details) {
        setProfileDraft(prev => ({
          ...prev,
          basicDetails: {
            fullName: parsedData.basic_details.full_name,
            location: parsedData.basic_details.location,
            email: parsedData.basic_details.email,
            contactNumber: parsedData.basic_details.contact_number,
          },
        }));
      }

      if (parsedData.experience && parsedData.experience.length > 0) {
        setProfileDraft(prev => ({
          ...prev,
          experience: parsedData.experience.map(exp => ({
            id: generateId(),
            company: exp.company,
            role: exp.role,
            timeline: exp.timeline,
          })),
        }));
      }

      if (parsedData.education && parsedData.education.length > 0) {
        setProfileDraft(prev => ({
          ...prev,
          education: parsedData.education.map(edu => ({
            id: generateId(),
            institution: edu.institution,
            program: edu.program,
            timeline: edu.timeline,
          })),
        }));
      }

      const entries: CVEntry[] = [
        ...parsedData.experience.map(exp => ({
          id: generateId(),
          type: 'work' as const,
          title: exp.role,
          organization: exp.company,
          startDate: exp.timeline,
        })),
        ...parsedData.education.map(edu => ({
          id: generateId(),
          type: 'education' as const,
          title: edu.program,
          organization: edu.institution,
          startDate: edu.timeline,
        })),
      ];
      setCvEntries(entries);

      setState('cv-review');
      addAssistantMessage(
        "Here's what I found from your CV.\n\nPlease review and confirm. You can edit or remove anything.",
        800
      );
    } catch (err) {
      console.error('CV parsing error:', err);
      addAssistantMessage(
        "I had trouble parsing that file. You can try uploading again, or we can skip this step and I'll ask you directly.",
        800
      );
    } finally {
      setIsParsingCV(false);
    }
  }, [addAssistantMessage]);

  // Handle CV skip - show save progress form
  const skipCv = useCallback(() => {
    setState('save-progress');
    addAssistantMessage(
      "No problem.\n\nLet's save your progress with just the basics.",
      800
    );
  }, [addAssistantMessage]);

  // Handle save progress form submission
  const handleSaveProgress = useCallback((data: {
    name: string;
    email: string;
    workStatus: 'open' | 'exploring';
    location?: string;
    timezone?: string;
  }) => {
    // Update profile draft with basic details
    setProfileDraft(prev => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        fullName: data.name,
        email: data.email,
        location: data.location || null,
      },
    }));
    
    // Proceed to intent availability question
    setState('intent-availability');
    addAssistantMessage(
      "When would you be open to starting a new role?",
      800
    );
  }, [addAssistantMessage]);

  const handleCvReviewComplete = useCallback(() => {
    goToIntentAvailability();
  }, []);

  // ========================================
  // STATE 1: Intent & Constraints (Layer 1)
  // ========================================

  const goToIntentAvailability = useCallback(() => {
    setState('intent-availability');
    addAssistantMessage(
      "When would you be open to starting a new role?",
      800
    );
  }, [addAssistantMessage]);

  const handleAvailabilitySelected = useCallback((availability: TalentIntent['availability']) => {
    const labels: Record<string, string> = {
      'immediately': 'Immediately',
      'in-1-3-months': 'In 1–3 months',
      'in-3-6-months': 'In 3–6 months',
      'exploring': 'Just exploring right now',
    };
    
    addUserMessage(labels[availability!] || availability!);
    updateIntent('availability', availability);
    
    setState('intent-work-types');
    addAssistantMessage(
      "What kind of work are you open to right now?",
      1000
    );
  }, [addUserMessage, updateIntent, addAssistantMessage]);

  const handleWorkTypesSelected = useCallback((workTypes: TalentIntent['workTypes']) => {
    const labels: Record<string, string> = {
      'full-time': 'Full-time',
      'contract': 'Contract',
      'fractional': 'Fractional',
      'advisory': 'Advisory',
      'open': 'Open to discussing',
    };
    
    addUserMessage(workTypes.map(t => labels[t]).join(', '));
    updateIntent('workTypes', workTypes);
    
    setState('intent-work-style');
    addAssistantMessage(
      "How do you prefer to work?",
      1000
    );
  }, [addUserMessage, updateIntent, addAssistantMessage]);

  const handleWorkStyleSelected = useCallback((workStyle: TalentIntent['workStyle'], locationConstraints?: string) => {
    const labels: Record<string, string> = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'on-site': 'On-site',
      'flexible': 'Flexible',
    };
    
    addUserMessage(labels[workStyle!] || workStyle!);
    updateIntent('workStyle', workStyle);
    if (locationConstraints) {
      updateIntent('locationConstraints', locationConstraints);
    }
    
    // Trigger transition to Layer 2
    triggerTransition();
  }, [addUserMessage, updateIntent]);

  // ========================================
  // STATE 1.5: Transition Animation
  // ========================================

  const triggerTransition = useCallback(() => {
    setIsTransitioning(true);
    setState('transition');
    
    // Brief pause for visual effect
    setTimeout(() => {
      addAssistantMessage(
        "Thanks.\n\nI've got the basics now.\nNext, I want to understand how you actually approach real work.\n\nThere are no right answers here.\nI'm just trying to understand how you think.",
        600
      );
      
      // After message, proceed to Layer 2
      setTimeout(() => {
        setIsTransitioning(false);
        setState('decision-anchor');
        addAssistantMessage(
          "Think about a real piece of work you've done — proud or messy.\n\nWhat was the goal, and what made it hard?",
          1200
        );
      }, 3000);
    }, 800);
  }, [addAssistantMessage]);

  // ========================================
  // STATE 2: Decision Evidence (Layer 2)
  // ========================================

  const handleAnchorResponse = useCallback((response: string) => {
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

    addUserMessage(response);
    updateDecisionScenario('contextSummary', response);
    
    setState('decision-prioritization');
    addAssistantMessage(
      "In that situation, what did you prioritize, and what did you intentionally leave out?",
      1200
    );
  }, [addUserMessage, updateDecisionScenario, processUserInput, addAssistantMessage]);

  const handlePrioritizationResponse = useCallback((response: string) => {
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

    addUserMessage(response);
    updateDecisionScenario('prioritizationResponse', response);
    addTrait('approach', 'Makes tradeoffs explicit');
    
    setState('decision-judgment');
    addAssistantMessage(
      "What would have made you change direction?",
      1200
    );
  }, [addUserMessage, updateDecisionScenario, addTrait, processUserInput, addAssistantMessage]);

  const handleJudgmentResponse = useCallback((response: string) => {
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

    addUserMessage(response);
    updateDecisionScenario('judgmentResponse', response);
    addTrait('decisions', 'Adapts based on signals');
    
    setState('decision-reflection');
    addAssistantMessage(
      "Looking back now, what would you do differently?",
      1200
    );
  }, [addUserMessage, updateDecisionScenario, addTrait, processUserInput, addAssistantMessage]);

  const handleReflectionResponse = useCallback((response: string) => {
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

    addUserMessage(response);
    updateDecisionScenario('reflectionResponse', response);
    addTrait('collaboration', 'Learns from iteration');
    
    setState('decision-self-insight');
    addAssistantMessage(
      "What did this experience teach you about how you work?",
      1200
    );
  }, [addUserMessage, updateDecisionScenario, addTrait, processUserInput, addAssistantMessage]);

  const handleSelfInsightResponse = useCallback((response: string) => {
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

    addUserMessage(response);
    updateDecisionScenario('selfInsightResponse', response);
    addTrait('environment', 'Self-aware about work patterns');
    
    // Generate interpretation
    const interpretation = generateInterpretation();
    setInterpretation(interpretation);
    
    setState('decision-interpretation');
    addAssistantMessage(
      "Here's a draft of how your work style comes across based on what you shared.\n\nTake a look on the right.\n\nDoes this feel accurate?",
      1500
    );
  }, [addUserMessage, updateDecisionScenario, addTrait, setInterpretation, processUserInput, addAssistantMessage]);

  // Generate interpretation from responses
  const generateInterpretation = useCallback(() => {
    const scenario = profileDraft.decisionTrace?.scenario;
    if (!scenario) return '';
    
    // Simple interpretation based on responses
    const traits: string[] = [];
    
    if (scenario.prioritizationResponse) {
      traits.push('You approach problems by making clear tradeoffs');
    }
    if (scenario.judgmentResponse) {
      traits.push('You adapt direction based on new information');
    }
    if (scenario.reflectionResponse) {
      traits.push('You reflect on outcomes to improve');
    }
    if (scenario.selfInsightResponse) {
      traits.push('You understand your own working patterns');
    }
    
    return traits.join('. ') + '.';
  }, [profileDraft.decisionTrace?.scenario]);

  const handleConfirmInterpretation = useCallback(() => {
    confirmInterpretation();
    
    setState('evidence');
    addAssistantMessage(
      "If you'd like, you can add something real you've worked on.\n\nA doc, design, code sample, deck, or link.\n\nIf not, that's completely fine. Many great projects aren't shareable.",
      1200
    );
  }, [confirmInterpretation, addAssistantMessage]);

  const handleTweakInterpretation = useCallback(() => {
    addAssistantMessage(
      "What would you like to adjust or clarify?",
      800
    );
  }, [addAssistantMessage]);

  const handleTweakResponse = useCallback((response: string) => {
    addUserMessage(response);
    
    // Update interpretation with tweaks
    const currentInterpretation = profileDraft.decisionTrace?.interpretation || '';
    setInterpretation(`${currentInterpretation} Additional context: ${response}`);
    
    addAssistantMessage(
      "I've updated the draft. Does this feel accurate now?",
      1000
    );
  }, [addUserMessage, profileDraft.decisionTrace?.interpretation, setInterpretation, addAssistantMessage]);

  // ========================================
  // Evidence & Completion
  // ========================================

  const skipEvidence = useCallback(() => {
    goToComplete();
  }, []);

  const addEvidence = useCallback((evidence: ProfileDraft['evidence'][0]) => {
    setProfileDraft(prev => ({
      ...prev,
      evidence: [...(prev.evidence || []), evidence],
    }));
    goToComplete();
  }, []);

  const goToComplete = useCallback(() => {
    setState('complete');
    addAssistantMessage(
      "That's it for now.\n\nThis gives teams real context on how you think and work.\nYou can always add more later.",
      1000
    );
  }, [addAssistantMessage]);

  const toggleAnonymous = useCallback(() => {
    setIsAnonymous(prev => !prev);
    setProfileDraft(prev => ({
      ...prev,
      isAnonymous: !prev.isAnonymous,
    }));
  }, []);

  return {
    state,
    setState,
    messages,
    cvEntries,
    setCvEntries,
    profileDraft,
    isTyping,
    isAnonymous,
    setIsAnonymous,
    openToConversations,
    setOpenToConversations,
    isParsingCV,
    isTransitioning,
    
    // Actions - State 0
    handleWelcome,
    goToCvUpload,
    handleCvUpload,
    skipCv,
    handleSaveProgress,
    handleCvReviewComplete,
    
    // Actions - Layer 1 (Intent)
    handleAvailabilitySelected,
    handleWorkTypesSelected,
    handleWorkStyleSelected,
    
    // Actions - Transition
    triggerTransition,
    
    // Actions - Layer 2 (Decision Evidence)
    handleAnchorResponse,
    handlePrioritizationResponse,
    handleJudgmentResponse,
    handleReflectionResponse,
    handleSelfInsightResponse,
    handleConfirmInterpretation,
    handleTweakInterpretation,
    handleTweakResponse,
    
    // Actions - Evidence & Complete
    skipEvidence,
    addEvidence,
    goToComplete,
    
    // Profile management
    addTrait,
    removeTrait,
    addAssistantMessage,
    addUserMessage,
    updateBasicDetails,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
    toggleAnonymous,
    processUserInput,
  };
};
