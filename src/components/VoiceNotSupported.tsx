import { motion } from 'framer-motion';
import { AlertTriangle, Chrome, ExternalLink, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VoiceNotSupportedProps {
  reason: 'browser' | 'https' | 'permission' | 'error';
  onDismiss?: () => void;
  onRetry?: () => void;
}

const reasonConfig = {
  browser: {
    icon: Chrome,
    title: 'Voice Not Supported',
    description: 'Your browser does not support voice features. For the best experience, please use Chrome or Edge.',
    action: 'Continue with text',
    showRetry: false,
  },
  https: {
    icon: AlertTriangle,
    title: 'Secure Connection Required',
    description: 'Voice features require a secure HTTPS connection. Please access this page via HTTPS.',
    action: 'Continue with text',
    showRetry: false,
  },
  permission: {
    icon: MicOff,
    title: 'Microphone Access Denied',
    description: 'Voice input requires microphone access. Please enable it in your browser settings and try again.',
    action: 'Continue with text',
    showRetry: true,
  },
  error: {
    icon: AlertTriangle,
    title: 'Voice Error',
    description: 'An error occurred with voice features. You can try again or continue with text input.',
    action: 'Continue with text',
    showRetry: true,
  },
};

export function VoiceNotSupported({ reason, onDismiss, onRetry }: VoiceNotSupportedProps) {
  const config = reasonConfig[reason];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-50"
    >
      <Card className="glass-card border-verdict-caution/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-verdict-caution/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-verdict-caution" />
            </div>
            <div>
              <CardTitle className="text-base">{config.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>{config.description}</CardDescription>
          
          <div className="flex items-center gap-2">
            {config.showRetry && onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <Mic className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                {config.action}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Inline hint for voice mode
interface VoiceHintProps {
  type: 'permission' | 'speak' | 'listen' | 'submit';
  className?: string;
}

const hintConfig = {
  permission: {
    text: 'Click to allow microphone access',
    icon: Mic,
  },
  speak: {
    text: 'AI is speaking...',
    icon: null,
  },
  listen: {
    text: 'Speak your response',
    icon: Mic,
  },
  submit: {
    text: 'Response will be submitted when you pause',
    icon: null,
  },
};

export function VoiceHint({ type, className }: VoiceHintProps) {
  const config = hintConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      <span>{config.text}</span>
    </motion.div>
  );
}

// Browser support check info
export function BrowserSupportInfo() {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border text-sm">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-verdict-caution" />
        Voice Features
      </h4>
      <p className="text-muted-foreground mb-3">
        Voice input and text-to-speech require a modern browser with Web Speech API support.
      </p>
      <div className="space-y-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Chrome className="w-4 h-4" />
          <span>Chrome / Edge — Full support</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          <span>Firefox — Partial support (no speech recognition)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span>Safari — Partial support</span>
        </div>
      </div>
    </div>
  );
}
