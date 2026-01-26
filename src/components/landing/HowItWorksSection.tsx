import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Video, Code, Palette, FileText } from 'lucide-react';

const signalTiles = [
  { icon: Video, label: 'AI Walkthrough' },
  { icon: Code, label: 'Code / Repo' },
  { icon: Palette, label: 'Design / Prototype' },
  { icon: FileText, label: 'Docs / Writing' },
];

export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 lg:py-[120px] relative bg-background"
    >
      <div className="container mx-auto px-6 lg:px-16 max-w-[1200px]">
        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN — Editorial Text */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              duration: shouldReduceMotion ? 0 : 0.5, 
              ease: 'easeOut' 
            }}
            className="flex flex-col"
          >
            {/* Section Label */}
            <p className="text-sm font-medium tracking-[0.08em] uppercase mb-6 text-muted-foreground">
              HOW IT WORKS
            </p>

            {/* Primary Headline */}
            <h2 className="text-[32px] md:text-[40px] font-bold leading-[1.2] mb-7 max-w-[520px] text-foreground font-display">
              Talent shares how they work
            </h2>

            {/* Body Copy */}
            <div className="space-y-4 max-w-[480px]">
              <p className="text-base leading-[1.75] text-muted-foreground">
                Talent can share real work evidence - code, products, designs, writing, or past projects.
              </p>
              <p className="text-base leading-[1.75] text-muted-foreground">
                If nothing exists, HumiQ adapts automatically.
              </p>
            </div>

            {/* Principle Line */}
            <p className="text-[15px] leading-[1.6] mt-5 mb-8 text-muted-foreground">
              Signal comes from how someone works, not how they present.
            </p>

            {/* Trust Pill */}
            <div className="inline-flex items-center h-9 px-[18px] rounded-full bg-foreground/5">
              <span className="text-[13px] text-foreground">
                No required uploads. No penalties for missing artifacts.
              </span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Visual Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ 
              duration: shouldReduceMotion ? 0 : 0.5, 
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: 'easeOut' 
            }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[420px] p-6 rounded-2xl glass-card">
              {/* Card Title */}
              <p className="text-[11px] tracking-[0.12em] uppercase text-center mb-5 text-muted-foreground">
                WORK SIGNALS
              </p>

              {/* Signal Tiles Grid */}
              <div className="grid grid-cols-2 gap-4">
                {signalTiles.map((tile, index) => (
                  <motion.div
                    key={tile.label}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ 
                      duration: shouldReduceMotion ? 0 : 0.4, 
                      delay: shouldReduceMotion ? 0 : 0.2 + index * 0.12,
                      ease: 'easeOut' 
                    }}
                    className="group flex flex-col items-center justify-center h-24 rounded-xl bg-secondary transition-all duration-400 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <tile.icon className="w-6 h-6 mb-2 text-foreground/70" />
                    <span className="text-[13px] text-foreground">
                      {tile.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer Reassurance */}
              <p className="text-sm text-center mt-5 text-muted-foreground">
                Any signal works. Even none.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}