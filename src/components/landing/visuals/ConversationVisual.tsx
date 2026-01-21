import { motion, useReducedMotion } from 'framer-motion';

const conversationBubbles = [
  "What tradeoff mattered most here?",
  "What did you personally own?",
  "What would you change today?",
];

interface ConversationVisualProps {
  isInView: boolean;
}

export function ConversationVisual({ isInView }: ConversationVisualProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.5, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-2xl glass-card"
    >
      {/* Card Header */}
      <p className="text-[11px] tracking-[0.12em] uppercase text-center mb-5 text-muted-foreground font-medium">
        AI CONVERSATION
      </p>

      {/* Conversation Bubbles */}
      <div className="space-y-3">
        {conversationBubbles.map((bubble, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ 
              duration: shouldReduceMotion ? 0 : 0.4, 
              delay: shouldReduceMotion ? 0 : 0.12 * (index + 1),
              ease: 'easeOut' 
            }}
            className="flex items-start gap-3"
          >
            {/* AI indicator dot */}
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-foreground" />
            
            {/* Bubble */}
            <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-secondary">
              <p className="text-[14px] leading-relaxed text-foreground">
                {bubble}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px my-5 bg-foreground/5" />

      {/* Footer Tag */}
      <div className="flex justify-center">
        <span className="px-3 py-1.5 rounded-full text-[12px] bg-secondary text-muted-foreground">
          Not a test · No scripts
        </span>
      </div>
    </motion.div>
  );
}