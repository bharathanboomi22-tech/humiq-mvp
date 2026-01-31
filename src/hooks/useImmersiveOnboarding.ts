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
  ValidationResult
} from '@/components/talent-onboarding/types';

const generateId = () => Math.random().toString(36).slice(2, 11);

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
    { id: 'approach', title: 'How you approach problems', traits: [], isDraft: true },
    { id: 'decisions', title: 'How you make decisions', traits: [], isDraft: true },
    { id: 'collaboration', title: 'How you work with others', traits: [], isDraft: true },
    { id: 'environment', title: 'Environments you thrive in', traits: [], isDraft: true },
  ],
  evidence: [],
  isAnonymous: true,
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(INITIAL_PROFILE_DRAFT);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [openToConversations, setOpenToConversations] = useState(true);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isParsingCV, setIsParsingCV] = useState(false);

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

  // Handle CV upload with AI parsing
  const handleCvUpload = useCallback(async (file: File) => {
    setIsParsingCV(true);
    addAssistantMessage("Parsing your CV...", 500);

    try {
      // Read file as base64
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call edge function to parse CV
      const { data, error } = await supabase.functions.invoke('parse-cv', {
        body: { 
          fileContent,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      const parsedData = data as CVParseResult;

      // Update profile with parsed data
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

      // Add experience entries
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

      // Add education entries
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

      // Convert to legacy CVEntry format for review
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
    // Validate input first
    const validation = processUserInput(response);
    if (!validation.isValid) {
      addAssistantMessage(validation.message || "Could you clarify that?", 800);
      return;
    }

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
  }, [simulationStep, addUserMessage, addAssistantMessage, addTrait, processUserInput]);

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
    selectedRoles,
    selectedProblems,
    profileDraft,
    isTyping,
    isAnonymous,
    setIsAnonymous,
    openToConversations,
    setOpenToConversations,
    simulationStep,
    isParsingCV,
    
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
    
    // Profile management
    updateBasicDetails,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
    toggleAnonymous,
    processUserInput,
  };
};
