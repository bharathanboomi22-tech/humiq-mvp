import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, MessageSquare, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useOpenAITTS } from '@/hooks/useOpenAITTS';
import { 
  getDiscoverySession, 
  appendDiscoveryMessage, 
  getNextDiscoveryPrompt,
  completeDiscoverySession 
} from '@/lib/discovery';
import { getStoredTalentId } from '@/lib/talent';
import { DiscoverySession } from '@/types/talent';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}

const TalentDiscoverySession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const talentId = getStoredTalentId();

  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transcript, setTranscript] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Voice hooks
  const { speak, isSpeaking, stop: stopSpeaking } = useOpenAITTS() as { speak: (text: string) => Promise<void>; isSpeaking: boolean; stop?: () => void };
  const { 
    isListening, 
    startListening, 
    stopListening, 
    isSupported: isSpeechSupported 
  } = useSpeechRecognition({
    onResult: setTranscript,
    onEnd: (finalTranscript) => {
      if (finalTranscript?.trim()) {
        handleUserResponse(finalTranscript);
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load session and start conversation
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || !talentId || hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        const sessionData = await getDiscoverySession(sessionId);
        if (!sessionData) {
          toast.error('Session not found');
          navigate('/talent/dashboard');
          return;
        }

        setSession(sessionData);

        // Load existing messages from session
        if (sessionData.messages && sessionData.messages.length > 0) {
          setMessages(sessionData.messages.map((m, i) => ({
            id: `${i}`,
            ...m,
          })));
        }

        // If session is already complete, redirect
        if (sessionData.completed_at) {
          setIsComplete(true);
          setIsLoading(false);
          return;
        }

        // Get first AI prompt if no messages yet
        if (!sessionData.messages || sessionData.messages.length === 0) {
          setIsLoading(false);
          await getNextAIPrompt();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        toast.error('Failed to load session');
        navigate('/talent/dashboard');
      }
    };

    loadSession();
  }, [sessionId, talentId, navigate]);

  const getNextAIPrompt = async (userResponse?: string) => {
    if (!sessionId || !talentId) return;

    setIsProcessing(true);
    try {
      const { prompt, isComplete: completed } = await getNextDiscoveryPrompt(
        sessionId,
        talentId,
        userResponse
      );

      // Append AI message
      await appendDiscoveryMessage(sessionId, 'ai', prompt);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: prompt,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);

      // Speak the prompt
      await speak(prompt);

      if (completed) {
        setIsComplete(true);
        // Complete the session and generate profile
        await completeDiscoverySession(sessionId);
        toast.success('Discovery complete! Your profile has been updated.');
        setTimeout(() => navigate('/talent/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Failed to get AI prompt:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserResponse = useCallback(async (response: string) => {
    if (!sessionId || !response.trim() || isProcessing) return;

    setTranscript('');

    // Append user message
    await appendDiscoveryMessage(sessionId, 'user', response);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);

    // Get next AI prompt
    await getNextAIPrompt(response);
  }, [sessionId, isProcessing]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen blush-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading discovery session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen blush-gradient">
      {/* Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(255, 182, 193, 0.15), transparent 50%)',
        }}
      />

      <div className="relative z-10 container max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Discovery Conversation
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Tell us about yourself
          </h1>
          <p className="text-muted-foreground">
            Have a natural conversation with our AI to build your profile
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-8 min-h-[400px] max-h-[500px] overflow-y-auto p-4 rounded-xl bg-background/30 border border-border/30">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground rounded-br-sm'
                      : 'bg-background/50 border border-border/50 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-background/50 border border-border/50 p-4 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Current transcript */}
        {transcript && (
          <Card className="glass-card mb-4">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="w-4 h-4 text-accent animate-pulse" />
                <span>{transcript}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isComplete && (
          <div className="flex flex-col items-center gap-4">
            {/* Voice control */}
            {isSpeechSupported ? (
              <Button
                size="lg"
                onClick={toggleListening}
                disabled={isProcessing}
                className={`rounded-full w-20 h-20 ${
                  isListening ? 'bg-destructive hover:bg-destructive/80' : ''
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Voice not supported. Please use a browser with speech recognition.
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Listening... Click to stop
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  Speaking...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Click to speak
                </>
              )}
            </div>
          </div>
        )}

        {/* Complete message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Discovery Complete!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your profile has been updated with your insights.
            </p>
            <Button onClick={() => navigate('/talent/dashboard')}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default TalentDiscoverySession;
