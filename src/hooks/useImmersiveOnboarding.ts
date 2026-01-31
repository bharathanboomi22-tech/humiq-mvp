import { useState, useCallback } from 'react';
import type { 
  OnboardingState, 
  ChatMessage, 
  ProfileDraft, 
  CVEntry 
} from '@/components/talent-onboarding/types';

const INITIAL_PROFILE_DRAFT: ProfileDraft = {
  sections: [
    { id: 'approach', title: 'How you approach problems', traits: [], isDraft: true },
    { id: 'decisions', title: 'How you make decisions', traits: [], isDraft: true },
    { id: 'collaboration', title: 'How you work with others', traits: [], isDraft: true },
    { id: 'environment', title: 'Environments you thrive in', traits: [], isDraft: true },
  ],
  evidence: [],
  isAnonymous: true,
};

const generateId = () => Math.random().toString(36).slice(2, 11);

export const useImmersiveOnboarding = () => {
  const [state, setState] = useState<OnboardingState>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cvEntries, setCvEntries] = useState<CVEntry[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(INITIAL_PROFILE_DRAFT);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [openToConversations, setOpenToConversations] = useState(true);
  const [simulationStep, setSimulationStep] = useState(0);

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

  // Add trait to profile draft
  const addTrait = useCallback((sectionId: string, text: string) => {
    setProfileDraft(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, traits: [...section.traits, { id: generateId(), text, isNew: true }] }
          : section
      ),
    }));
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setProfileDraft(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
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
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, traits: section.traits.filter((_, i) => i !== traitIndex) }
          : section
      ),
    }));
  }, []);

  // State transition handlers
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

  const handleCvUpload = useCallback((file: File) => {
    // Simulate CV parsing
    const mockEntries: CVEntry[] = [
      { id: generateId(), type: 'work', title: 'Senior Engineer', organization: 'TechCorp', startDate: '2022', endDate: 'Present' },
      { id: generateId(), type: 'work', title: 'Engineer', organization: 'StartupXYZ', startDate: '2020', endDate: '2022' },
      { id: generateId(), type: 'education', title: 'B.S. Computer Science', organization: 'University', startDate: '2016', endDate: '2020' },
    ];
    setCvEntries(mockEntries);
    setState('cv-review');
    addAssistantMessage(
      "Here's what I picked up.\n\nTake a moment to review. You can edit or remove anything.",
      1200
    );
  }, [addAssistantMessage]);

  const skipCv = useCallback(() => {
    setState('exploration');
    addAssistantMessage(
      "What kind of work are you exploring right now?",
      800
    );
  }, [addAssistantMessage]);

  const handleCvReviewComplete = useCallback(() => {
    setState('exploration');
    addAssistantMessage(
      "What kind of work are you exploring right now?",
      800
    );
  }, [addAssistantMessage]);

  const handleRolesSelected = useCallback((roles: string[]) => {
    setSelectedRoles(roles);
    if (roles.length > 0) {
      addUserMessage(roles.join(', '));
      setTimeout(() => {
        addAssistantMessage(
          "What kinds of problems do you enjoy working on?",
          1000
        );
      }, 500);
    }
  }, [addUserMessage, addAssistantMessage]);

  const handleProblemsSelected = useCallback((problems: string[]) => {
    setSelectedProblems(problems);
    if (problems.length > 0) {
      addUserMessage(problems.join(', '));
      setState('simulation-intro');
      setTimeout(() => {
        addAssistantMessage(
          "Great.\n\nI'm going to walk you through a realistic work situation.\n\nThere are no right answers. I just want to understand how you think.",
          1200
        );
      }, 500);
    }
  }, [addUserMessage, addAssistantMessage]);

  const startSimulation = useCallback(() => {
    setState('simulation');
    setSimulationStep(0);
    addAssistantMessage(
      "Think about a real piece of work you've done — proud or messy.\n\nWhat was the goal, and what made it hard?",
      1000
    );
  }, [addAssistantMessage]);

  const handleSimulationResponse = useCallback((response: string) => {
    addUserMessage(response);
    
    const simulationQuestions = [
      "What would you do first?",
      "What would you prioritize, and what would you intentionally leave out?",
      "What would make you change direction?",
      "Looking back, what would you do differently now?",
      "What did this experience teach you about how you work?",
    ];

    const traits = [
      { section: 'approach', text: 'Works through ambiguity' },
      { section: 'decisions', text: 'Makes tradeoffs explicit' },
      { section: 'approach', text: 'Adapts based on signals' },
      { section: 'collaboration', text: 'Seeks input before committing' },
      { section: 'environment', text: 'Thrives with clear constraints' },
    ];

    const nextStep = simulationStep + 1;
    setSimulationStep(nextStep);

    if (nextStep < simulationQuestions.length) {
      // Add a trait based on response
      if (nextStep > 0 && traits[nextStep - 1]) {
        addTrait(traits[nextStep - 1].section, traits[nextStep - 1].text);
      }
      
      setTimeout(() => {
        addAssistantMessage(simulationQuestions[nextStep], 1200);
      }, 500);
    } else {
      // Add final trait and move to evidence
      if (traits[nextStep - 1]) {
        addTrait(traits[nextStep - 1].section, traits[nextStep - 1].text);
      }
      setState('evidence');
      setTimeout(() => {
        addAssistantMessage(
          "If you'd like, you can add something real you've worked on.\n\nA doc, design, code, deck, or link.\n\nIf not, that's completely fine. Many great projects aren't shareable.",
          1200
        );
      }, 500);
    }
  }, [simulationStep, addUserMessage, addAssistantMessage, addTrait]);

  const skipEvidence = useCallback(() => {
    setState('confirmation');
    addAssistantMessage(
      "Here's a draft of how your work style comes across.\n\nTake a look on the right. Does this feel accurate?",
      1000
    );
  }, [addAssistantMessage]);

  const addEvidence = useCallback((evidence: ProfileDraft['evidence'][0]) => {
    setProfileDraft(prev => ({
      ...prev,
      evidence: [...(prev.evidence || []), evidence],
    }));
    setState('confirmation');
    addAssistantMessage(
      "Here's a draft of how your work style comes across.\n\nTake a look on the right. Does this feel accurate?",
      1000
    );
  }, [addAssistantMessage]);

  const confirmProfile = useCallback(() => {
    setState('complete');
    addAssistantMessage(
      "You're live.\n\nYou won't apply for jobs here. Conversations start when there's real interest on both sides.",
      1000
    );
  }, [addAssistantMessage]);

  return {
    state,
    setState,
    messages,
    cvEntries,
    setCvEntries,
    selectedRoles,
    selectedProblems,
    profileDraft,
    isTyping,
    isAnonymous,
    setIsAnonymous,
    openToConversations,
    setOpenToConversations,
    simulationStep,
    
    // Actions
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
    addTrait,
    removeTrait,
    addAssistantMessage,
    addUserMessage,
  };
};
