import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Send, 
  Loader2, 
  ArrowRight, 
  Code, 
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { WorkSessionTimer } from '@/components/WorkSessionTimer';
import { StageProgress, StageProgressCompact } from '@/components/StageProgress';
import { CodeEditor } from '@/components/CodeEditor';
import { VoiceControls, LiveTranscript } from '@/components/VoiceControls';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useOpenAITTS } from '@/hooks/useOpenAITTS';
import { checkVoiceFeatures, requestMicrophonePermission } from '@/lib/audioPermissions';
import { 
  getWorkSession, 
  addSessionEvent, 
  getNextPrompt, 
  completeSession 
} from '@/lib/workSession';
import { 
  StageName, 
  STAGE_ORDER, 
  STAGE_CONFIG,
  DEMO_STAGE_ORDER,
  DEMO_STAGE_CONFIG,
  WorkSession,
  ResponseContent,
  CodeSnapshotContent
} from '@/types/workSession';

interface Message {
  id: string;
  type: 'prompt' | 'response';
  text: string;
  stage: StageName;
  timestamp: Date;
  signalTags?: string[];
  isVoice?: boolean;
}

const WorkSessionLive = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const [session, setSession] = useState<WorkSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [currentStage, setCurrentStage] = useState<StageName>('framing');
  const [completedStages, setCompletedStages] = useState<StageName[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [response, setResponse] = useState('');
  const [code, setCode] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  
  // Voice state
  const [isVoiceMode, setIsVoiceMode] = useState(true); // Auto-activate voice mode
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [pendingSpeak, setPendingSpeak] = useState<string | null>(null);
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoListenRef = useRef(false);

  // Use demo stages (2 questions) when duration is 5 minutes
  const isDemoMode = session?.duration === 5;
  const activeStageOrder = isDemoMode ? DEMO_STAGE_ORDER : STAGE_ORDER;
  const activeStageConfig = isDemoMode ? DEMO_STAGE_CONFIG : STAGE_CONFIG;

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: recognitionError,
    isSupported: recognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    interimResults: true,
    silenceTimeout: 5000,
    onEnd: (finalTranscript) => {
      // Auto-submit when stopped and has transcript
      console.log('Recognition ended with transcript:', finalTranscript);
      if (finalTranscript && isVoiceMode) {
        handleVoiceSubmit(finalTranscript);
      }
    },
    onError: (error) => {
      setVoiceError(error);
      if (error.includes('denied')) {
        setIsVoiceMode(false);
        toast.error('Microphone access denied. Switching to text mode.');
      }
    },
  });

  // OpenAI TTS hook (Echo voice)
  const {
    isSpeaking,
    isLoading: isTTSLoading,
    speak,
    cancel: cancelSpeech,
  } = useOpenAITTS({
    voice: 'echo',
    onEnd: () => {
      // Auto-start listening after AI finishes speaking
      if (isVoiceMode && autoListenRef.current) {
        autoListenRef.current = false;
        setTimeout(() => {
          resetTranscript();
          startListening();
        }, 500);
      }
    },
    onError: (error) => {
      setVoiceError(error);
      console.error('TTS Error:', error);
    },
  });

  // Check voice support on mount and auto-initialize
  useEffect(() => {
    async function checkSupport() {
      const status = await checkVoiceFeatures();
      // TTS is always available via OpenAI API, we just need mic for input
      setVoiceSupported(status.canUseRecognition || true); // TTS always works
      
      if (!voiceInitialized) {
        // Auto-request microphone permission for voice input
        const granted = await requestMicrophonePermission();
        if (granted) {
          setVoiceInitialized(true);
          console.log('Voice mode initialized with OpenAI TTS');
        } else {
          // Can still use TTS for output, just not voice input
          setVoiceInitialized(true);
          toast.info('Microphone not available. AI will speak, but you\'ll type responses.');
        }
      }
    }
    checkSupport();
  }, [voiceInitialized]);

  // Update voice error from recognition
  useEffect(() => {
    if (recognitionError) {
      setVoiceError(recognitionError);
    }
  }, [recognitionError]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Speak pending prompt when voice mode is active
  useEffect(() => {
    if (pendingSpeak && isVoiceMode && !isSpeaking && !isListening) {
      autoListenRef.current = true;
      speak(pendingSpeak);
      setPendingSpeak(null);
    }
  }, [pendingSpeak, isVoiceMode, isSpeaking, isListening, speak]);

  // Load session and get first prompt
  useEffect(() => {
    async function init() {
      if (!sessionId) {
        toast.error('Session ID is required');
        navigate('/work-session/start');
        return;
      }

      try {
        const sessionData = await getWorkSession(sessionId);
        if (!sessionData) {
          toast.error('Session not found');
          navigate('/work-session/start');
          return;
        }

        if (sessionData.status === 'completed') {
          toast.info('Session already completed');
          navigate(`/evidence-pack/${sessionId}`);
          return;
        }

        setSession(sessionData);
        setIsLoading(false);

        // Get first prompt
        setIsLoadingPrompt(true);
        const promptResult = await getNextPrompt(sessionId, 'framing');
        
        const promptText = promptResult.nextPrompt;
        setMessages([{
          id: crypto.randomUUID(),
          type: 'prompt',
          text: promptText,
          stage: 'framing',
          timestamp: new Date(),
          signalTags: promptResult.signalTags,
        }]);
        
        // Queue for speaking if voice mode is on
        setPendingSpeak(promptText);
        setIsLoadingPrompt(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast.error('Failed to load session');
        setIsLoading(false);
      }
    }

    init();
  }, [sessionId, navigate]);

  // Handle voice mode toggle
  const handleVoiceModeChange = async (enabled: boolean) => {
    if (enabled) {
      // Request permission first
      const granted = await requestMicrophonePermission();
      if (!granted) {
        toast.error('Microphone permission is required for voice mode');
        return;
      }
    } else {
      // Stop any ongoing voice activity
      stopListening();
      cancelSpeech();
    }
    setIsVoiceMode(enabled);
    setVoiceError(null);
  };

  // Handle microphone button click
  const handleMicClick = () => {
    if (isListening) {
      // Stop and submit
      handleSubmitVoice();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Handle manual voice submit (button click or auto from silence)
  const handleSubmitVoice = useCallback(() => {
    const currentTranscript = transcript.trim();
    console.log('Submitting voice response:', currentTranscript);
    
    stopListening();
    
    if (!currentTranscript || !sessionId) {
      console.log('No transcript to submit');
      return;
    }

    // Add response to messages
    const responseMessage: Message = {
      id: crypto.randomUUID(),
      type: 'response',
      text: currentTranscript,
      stage: currentStage,
      timestamp: new Date(),
      isVoice: true,
    };
    setMessages(prev => [...prev, responseMessage]);
    
    resetTranscript();

    // Process the response
    processResponse(currentTranscript);
  }, [transcript, sessionId, currentStage, stopListening, resetTranscript]);

  // Handle voice submit from onEnd callback
  const handleVoiceSubmit = async (voiceText: string) => {
    if (!voiceText.trim() || !sessionId) return;

    console.log('Auto-submitting voice:', voiceText);
    
    // Add response to messages
    const responseMessage: Message = {
      id: crypto.randomUUID(),
      type: 'response',
      text: voiceText,
      stage: currentStage,
      timestamp: new Date(),
      isVoice: true,
    };
    setMessages(prev => [...prev, responseMessage]);
    
    resetTranscript();

    // Process the response
    await processResponse(voiceText);
  };

  // Handle text response submission
  const handleSubmitResponse = async () => {
    if (!response.trim() && !code.trim()) {
      toast.error('Please enter a response');
      return;
    }

    if (!sessionId) return;

    const responseText = response.trim() || (code.trim() ? `[Code submitted]\n${code.trim()}` : '');
    
    // Add response to messages
    const responseMessage: Message = {
      id: crypto.randomUUID(),
      type: 'response',
      text: responseText,
      stage: currentStage,
      timestamp: new Date(),
      isVoice: false,
    };
    setMessages(prev => [...prev, responseMessage]);
    
    // Clear inputs
    setResponse('');
    
    // Process the response
    await processResponse(responseText);
  };

  // Common response processing
  const processResponse = async (responseText: string) => {
    if (!sessionId) return;

    // Save response event
    try {
      await addSessionEvent(sessionId, 'RESPONSE', {
        text: responseText,
        stage: currentStage,
      } as ResponseContent);

      // Save code snapshot if present
      if (code.trim()) {
        await addSessionEvent(sessionId, 'CODE_SNAPSHOT', {
          code: code.trim(),
          stage: currentStage,
        } as CodeSnapshotContent);
      }
    } catch (error) {
      console.error('Failed to save response:', error);
    }

    // Get next prompt
    setIsLoadingPrompt(true);
    try {
      const promptResult = await getNextPrompt(sessionId, currentStage, responseText);
      
      // Check if stage is complete
      if (promptResult.stageComplete) {
        const currentIndex = activeStageOrder.indexOf(currentStage);
        const isLastStage = currentIndex === activeStageOrder.length - 1;

        if (isLastStage) {
          handleCompleteSession();
          return;
        } else {
          setCompletedStages(prev => [...prev, currentStage]);
          const nextStage = activeStageOrder[currentIndex + 1];
          setCurrentStage(nextStage);
          
          const stageLabel = activeStageConfig[nextStage]?.label || nextStage;
          toast.success(`Moving to ${stageLabel}`);
        }
      }

      const promptText = promptResult.nextPrompt;
      
      // Add prompt to messages
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'prompt',
        text: promptText,
        stage: promptResult.stageComplete ? activeStageOrder[activeStageOrder.indexOf(currentStage) + 1] || currentStage : currentStage,
        timestamp: new Date(),
        signalTags: promptResult.signalTags,
      }]);

      // Queue for speaking if voice mode is on
      if (isVoiceMode) {
        setPendingSpeak(promptText);
      }
    } catch (error) {
      console.error('Failed to get next prompt:', error);
      toast.error('Failed to get next prompt');
    } finally {
      setIsLoadingPrompt(false);
      if (!isVoiceMode) {
        textareaRef.current?.focus();
      }
    }
  };

  // Handle stage skip
  const handleSkipStage = async () => {
    if (!sessionId) return;

    // Stop voice activity
    if (isVoiceMode) {
      stopListening();
      cancelSpeech();
    }

    const currentIndex = activeStageOrder.indexOf(currentStage);
    const isLastStage = currentIndex === activeStageOrder.length - 1;

    if (isLastStage) {
      handleCompleteSession();
      return;
    }

    setCompletedStages(prev => [...prev, currentStage]);
    const nextStage = activeStageOrder[currentIndex + 1];
    setCurrentStage(nextStage);

    // Get first prompt for new stage
    setIsLoadingPrompt(true);
    try {
      const promptResult = await getNextPrompt(sessionId, nextStage);
      const promptText = promptResult.nextPrompt;
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'prompt',
        text: promptText,
        stage: nextStage,
        timestamp: new Date(),
        signalTags: promptResult.signalTags,
      }]);

      // Queue for speaking if voice mode is on
      if (isVoiceMode) {
        setPendingSpeak(promptText);
      }
    } catch (error) {
      console.error('Failed to get prompt for new stage:', error);
      toast.error('Failed to start new stage');
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  // Handle session completion
  const handleCompleteSession = async () => {
    if (!sessionId) return;

    // Stop voice activity
    if (isVoiceMode) {
      stopListening();
      cancelSpeech();
    }

    setIsCompleting(true);
    try {
      const result = await completeSession(sessionId);
      
      // Check if this is an interview and redirect accordingly
      if (result.isInterview && result.interviewResultId) {
        toast.success('Interview completed!');
        navigate(`/interview/result/${result.interviewResultId}`);
        return;
      }
      toast.success('Session completed! Generating Evidence Pack...');
      navigate(`/evidence-pack/${sessionId}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle code snapshot
  const handleCodeSnapshot = async (newCode: string) => {
    if (!sessionId) return;

    try {
      await addSessionEvent(sessionId, 'CODE_SNAPSHOT', {
        code: newCode,
        stage: currentStage,
      } as CodeSnapshotContent);
    } catch (error) {
      console.error('Failed to save code snapshot:', error);
    }
  };

  // Handle time warning
  const handleTimeWarning = () => {
    toast.warning('5 minutes remaining. Consider wrapping up your current discussion.', {
      duration: 5000,
    });
  };

  // Handle time expired
  const handleTimeExpired = () => {
    toast.info('Time is up! You can continue or complete the session now.', {
      duration: 10000,
    });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isVoiceMode) {
      e.preventDefault();
      handleSubmitResponse();
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const currentIndex = activeStageOrder.indexOf(currentStage);
  const isLastStage = currentIndex === activeStageOrder.length - 1;

  return (
    <main className="min-h-screen bg-ambient flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Timer */}
            <WorkSessionTimer
              startedAt={new Date(session.started_at)}
              duration={session.duration}
              onTimeWarning={handleTimeWarning}
              onTimeExpired={handleTimeExpired}
            />

            {/* Voice Controls - Desktop */}
            <div className="hidden md:flex items-center">
              <VoiceControls
                isVoiceMode={isVoiceMode}
                onVoiceModeChange={handleVoiceModeChange}
                isListening={isListening}
                isSpeaking={isSpeaking}
                isSupported={voiceSupported && recognitionSupported}
                error={voiceError}
                onMicClick={handleMicClick}
                onStopSpeaking={cancelSpeech}
              />
            </div>

            {/* Stage Progress - Desktop */}
            <div className="hidden lg:block flex-1 max-w-xl mx-4">
              <StageProgress
                currentStage={currentStage}
                completedStages={completedStages}
                stageOrder={activeStageOrder}
                stageConfig={activeStageConfig}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipStage}
                disabled={isLoadingPrompt || isCompleting || isSpeaking}
              >
                {isLastStage ? 'Finish Session' : 'Skip Stage'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile row: Stage Progress + Voice Controls */}
          <div className="lg:hidden mt-3 flex items-center justify-between gap-4">
            <StageProgressCompact
              currentStage={currentStage}
              completedStages={completedStages}
              className="flex-1"
              stageOrder={activeStageOrder}
              stageConfig={activeStageConfig}
            />
            <VoiceControls
              isVoiceMode={isVoiceMode}
              onVoiceModeChange={handleVoiceModeChange}
              isListening={isListening}
              isSpeaking={isSpeaking}
              isSupported={voiceSupported && recognitionSupported}
              error={voiceError}
              onMicClick={handleMicClick}
              onStopSpeaking={cancelSpeech}
              compact
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.type === 'response' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[85%] p-4 ${
                    message.type === 'response'
                      ? 'bg-accent/10 border-accent/20'
                      : 'glass-card'
                  }`}
                >
                  {/* Stage badge for prompts */}
                  {message.type === 'prompt' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
                        {activeStageConfig[message.stage]?.label || STAGE_CONFIG[message.stage]?.label || message.stage}
                      </span>
                      {message.signalTags && message.signalTags.length > 0 && (
                        <div className="flex gap-1">
                          {message.signalTags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-verdict-interview/10 text-verdict-interview"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Voice indicator for responses */}
                  {message.type === 'response' && message.isVoice && (
                    <div className="flex items-center gap-1 mb-2">
                      <Mic className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Voice</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {(isLoadingPrompt || isTTSLoading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isTTSLoading ? 'Preparing voice...' : 'Thinking...'}
                  </span>
                </div>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          {/* Live Transcript with Submit Button (Voice Mode) */}
          <AnimatePresence>
            {isVoiceMode && (isListening || transcript || interimTranscript) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                <LiveTranscript
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  isListening={isListening}
                />
                {/* Voice Submit Button */}
                {(transcript || interimTranscript) && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSubmitVoice}
                      disabled={isLoadingPrompt || isCompleting || !transcript.trim()}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Voice Response
                    </Button>
                    {isListening && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          stopListening();
                          resetTranscript();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Editor Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showCodeEditor ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              {showCodeEditor ? 'Hide Code Editor' : 'Add Code'}
            </Button>
          </div>

          {/* Code Editor */}
          <AnimatePresence>
            {showCodeEditor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  onSnapshot={handleCodeSnapshot}
                  className="border border-border rounded-lg overflow-hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Mode: Start Recording Button */}
          <AnimatePresence>
            {isVoiceMode && !isListening && !transcript && !isSpeaking && !isLoadingPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    resetTranscript();
                    startListening();
                  }}
                  className="gap-3 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30"
                >
                  <Mic className="w-5 h-5" />
                  Click to Start Speaking
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Response Input (shown when not in voice mode, or as fallback) */}
          <AnimatePresence>
            {!isVoiceMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your response... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[100px] resize-none bg-card/50 pr-12"
                    disabled={isLoadingPrompt || isCompleting || isSpeaking}
                  />
                  <Button
                    size="icon"
                    onClick={handleSubmitResponse}
                    disabled={isLoadingPrompt || isCompleting || isSpeaking || (!response.trim() && !code.trim())}
                    className="absolute bottom-3 right-3 bg-accent hover:bg-accent/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completing Overlay */}
      {isCompleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generating Evidence Pack</h3>
            <p className="text-muted-foreground">Analyzing your session...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default WorkSessionLive;
