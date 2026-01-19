import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { User, Mail, Video, FileText, Users } from 'lucide-react';

const steps = [
  {
    icon: User,
    title: 'Talent shares their profile',
    description: 'Real work, past projects — or nothing at all.',
  },
  {
    icon: Mail,
    title: 'AI interview invite sent',
    description: 'Automatically, when a relevant match exists.',
  },
  {
    icon: Video,
    title: 'AI-led interview',
    description: 'Explores thinking, tradeoffs, and ownership.',
  },
  {
    icon: FileText,
    title: 'Decision sent to company',
    description: 'Clear recommendation, risks, and next steps.',
  },
  {
    icon: Users,
    title: 'Human interview invite',
    description: 'Only when the signal is strong.',
  },
];

export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle scroll snap for mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, steps.length - 1));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#070A10' }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124, 92, 255, 0.04), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-12 md:mb-16 md:sticky md:top-24 md:z-20"
        >
          <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-3">
            How HumIQ works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl">
            From real work to interview — without resumes or screening.
          </p>
        </motion.div>

        {/* Horizontal Scroll Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                delay: shouldReduceMotion ? 0 : index * 0.2,
                ease: 'easeOut',
              }}
              className="flex-shrink-0 w-[85%] md:w-[320px] lg:w-[360px] snap-center"
            >
              <div className="glass-card p-6 md:p-8 h-full group">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <step.icon
                    className="w-5 h-5 text-foreground/60 transition-all duration-300 group-hover:text-foreground/80"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0))',
                    }}
                    onMouseEnter={(e) => {
                      if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                        (e.target as SVGElement).style.filter = 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.3))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as SVGElement).style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0))';
                    }}
                  />
                </div>

                {/* Step number */}
                <div className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-3">
                  Step {index + 1}
                </div>

                {/* Title */}
                <h3 className="font-display text-lg font-medium text-foreground mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress dots - mobile only */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {steps.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: index === activeIndex 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : 'rgba(255, 255, 255, 0.15)',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
