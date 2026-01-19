import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceControlsProps {
  isVoiceMode: boolean;
  onVoiceModeChange: (enabled: boolean) => void;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
  onMicClick: () => void;
  onStopSpeaking: () => void;
  className?: string;
  compact?: boolean;
}

export function VoiceControls({
  isVoiceMode,
  onVoiceModeChange,
  isListening,
  isSpeaking,
  isSupported,
  error,
  onMicClick,
  onStopSpeaking,
  className,
  compact = false,
}: VoiceControlsProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2 opacity-50', className)}>
            <MicOff className="w-4 h-4 text-muted-foreground" />
            {!compact && <span className="text-xs text-muted-foreground">Voice unavailable</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice features are not supported in your browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Voice Mode Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="voice-mode"
          checked={isVoiceMode}
          onCheckedChange={onVoiceModeChange}
          className="data-[state=checked]:bg-accent"
        />
        {!compact && (
          <Label htmlFor="voice-mode" className="text-xs text-muted-foreground cursor-pointer">
            Voice
          </Label>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMicClick}
                  disabled={isSpeaking}
                  className={cn(
                    'relative w-10 h-10 rounded-full transition-all',
                    isListening && 'bg-destructive/20 hover:bg-destructive/30',
                    !isListening && !isSpeaking && 'hover:bg-accent/20'
                  )}
                >
                  {isListening ? (
                    <>
                      <Mic className="w-5 h-5 text-destructive" />
                      {/* Pulsing ring animation */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-destructive"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-destructive"
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                      />
                    </>
                  ) : (
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? 'Stop listening' : isSpeaking ? 'Wait for AI to finish' : 'Start listening'}
              </TooltipContent>
            </Tooltip>

            {/* Speaker/Stop Button */}
            {isSpeaking && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStopSpeaking}
                    className="w-10 h-10 rounded-full hover:bg-accent/20"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Volume2 className="w-5 h-5 text-accent" />
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop speaking</TooltipContent>
              </Tooltip>
            )}

            {/* Status Indicator */}
            {!compact && (
              <div className="min-w-[80px]">
                <AnimatePresence mode="wait">
                  {isListening && (
                    <motion.span
                      key="listening"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                      </span>
                      Listening...
                    </motion.span>
                  )}
                  {isSpeaking && !isListening && (
                    <motion.span
                      key="speaking"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-accent flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      Speaking...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error indicator */}
      <AnimatePresence>
        {showError && error && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="w-4 h-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>{error}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for mobile header
export function VoiceControlsCompact(props: Omit<VoiceControlsProps, 'compact'>) {
  return <VoiceControls {...props} compact />;
}

// Audio waveform visualization
interface AudioWaveformProps {
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ isActive, className }: AudioWaveformProps) {
  const bars = 5;

  return (
    <div className={cn('flex items-center gap-0.5 h-4', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-accent rounded-full"
          animate={isActive ? {
            height: ['4px', '16px', '4px'],
          } : {
            height: '4px',
          }}
          transition={isActive ? {
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          } : {
            duration: 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Live transcript display
interface LiveTranscriptProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  className?: string;
}

export function LiveTranscript({ 
  transcript, 
  interimTranscript, 
  isListening,
  className,
}: LiveTranscriptProps) {
  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  if (!displayText && !isListening) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg bg-card/50 border border-border',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {isListening ? (
            <AudioWaveform isActive={true} />
          ) : (
            <Mic className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-h-[24px]">
          {displayText ? (
            <p className="text-foreground">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground opacity-70">
                  {' '}{interimTranscript}
                </span>
              )}
            </p>
          ) : isListening ? (
            <p className="text-muted-foreground italic">Listening...</p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
