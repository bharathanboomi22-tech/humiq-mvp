import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Code, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { WorkSessionTimer } from '@/components/WorkSessionTimer';
import { StageProgress, StageProgressCompact } from '@/components/StageProgress';
import { CodeEditor } from '@/components/CodeEditor';
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
  WorkSession,
  PromptContent,
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load session and get first prompt
  useEffect(() => {
    async function init() {
      if (!sessionId) {
        toast.error('Session ID is required');
        navigate('/work-session/start');
        return;
      }

      try {
        // Fetch session details
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
        
        setMessages([{
          id: crypto.randomUUID(),
          type: 'prompt',
          text: promptResult.nextPrompt,
          stage: 'framing',
          timestamp: new Date(),
          signalTags: promptResult.signalTags,
        }]);
        setIsLoadingPrompt(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast.error('Failed to load session');
        setIsLoading(false);
      }
    }

    init();
  }, [sessionId, navigate]);

  // Handle response submission
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
    };
    setMessages(prev => [...prev, responseMessage]);
    
    // Clear inputs
    setResponse('');
    
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
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        const isLastStage = currentIndex === STAGE_ORDER.length - 1;

        if (isLastStage) {
          // Session complete
          handleCompleteSession();
          return;
        } else {
          // Move to next stage
          setCompletedStages(prev => [...prev, currentStage]);
          const nextStage = STAGE_ORDER[currentIndex + 1];
          setCurrentStage(nextStage);
          
          toast.success(`Stage complete! Moving to ${STAGE_CONFIG[nextStage].label}`);
        }
      }

      // Add prompt to messages
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'prompt',
        text: promptResult.nextPrompt,
        stage: promptResult.stageComplete ? STAGE_ORDER[STAGE_ORDER.indexOf(currentStage) + 1] || currentStage : currentStage,
        timestamp: new Date(),
        signalTags: promptResult.signalTags,
      }]);
    } catch (error) {
      console.error('Failed to get next prompt:', error);
      toast.error('Failed to get next prompt');
    } finally {
      setIsLoadingPrompt(false);
      textareaRef.current?.focus();
    }
  };

  // Handle stage skip (I'm done button)
  const handleSkipStage = async () => {
    if (!sessionId) return;

    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const isLastStage = currentIndex === STAGE_ORDER.length - 1;

    if (isLastStage) {
      handleCompleteSession();
      return;
    }

    setCompletedStages(prev => [...prev, currentStage]);
    const nextStage = STAGE_ORDER[currentIndex + 1];
    setCurrentStage(nextStage);

    // Get first prompt for new stage
    setIsLoadingPrompt(true);
    try {
      const promptResult = await getNextPrompt(sessionId, nextStage);
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'prompt',
        text: promptResult.nextPrompt,
        stage: nextStage,
        timestamp: new Date(),
        signalTags: promptResult.signalTags,
      }]);
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

    setIsCompleting(true);
    try {
      const result = await completeSession(sessionId);
      toast.success('Session completed! Generating Evidence Pack...');
      navigate(`/evidence-pack/${sessionId}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to complete session');
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
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const isLastStage = currentIndex === STAGE_ORDER.length - 1;

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

            {/* Stage Progress - Desktop */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <StageProgress
                currentStage={currentStage}
                completedStages={completedStages}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipStage}
                disabled={isLoadingPrompt || isCompleting}
              >
                {isLastStage ? 'Finish Session' : 'Skip Stage'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stage Progress - Mobile */}
          <div className="md:hidden mt-3">
            <StageProgressCompact
              currentStage={currentStage}
              completedStages={completedStages}
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
                        {STAGE_CONFIG[message.stage].label}
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
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoadingPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="space-y-4">
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

          {/* Response Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your response... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[100px] resize-none bg-card/50 pr-12"
                disabled={isLoadingPrompt || isCompleting}
              />
              <Button
                size="icon"
                onClick={handleSubmitResponse}
                disabled={isLoadingPrompt || isCompleting || (!response.trim() && !code.trim())}
                className="absolute bottom-3 right-3 bg-accent hover:bg-accent/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
