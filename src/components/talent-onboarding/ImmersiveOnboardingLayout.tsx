import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { ProfileDraftPanel } from './ProfileDraftPanel';
import type { ProfileDraft } from './types';

interface ImmersiveOnboardingLayoutProps {
  children: ReactNode;
  profileDraft: ProfileDraft;
  showProfileGlow?: boolean;
  onEditBasicDetail?: (field: keyof ProfileDraft['basicDetails']) => void;
  onEditExperience?: (id: string) => void;
  onRemoveExperience?: (id: string) => void;
  onEditEducation?: (id: string) => void;
  onRemoveEducation?: (id: string) => void;
  onEditTrait?: (sectionId: string, traitIndex: number) => void;
  onRemoveTrait?: (sectionId: string, traitIndex: number) => void;
  onToggleAnonymous?: () => void;
}

export const ImmersiveOnboardingLayout = ({
  children,
  profileDraft,
  showProfileGlow = false,
  onEditBasicDetail,
  onEditExperience,
  onRemoveExperience,
  onEditEducation,
  onRemoveEducation,
  onEditTrait,
  onRemoveTrait,
  onToggleAnonymous,
}: ImmersiveOnboardingLayoutProps) => {
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Atmospheric background with enhanced teal/green glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-background" />
        
        {/* Primary teal glow - bottom left */}
        <div 
          className="absolute bottom-0 left-0 w-[70%] h-[60%]"
          style={{
            background: 'radial-gradient(ellipse at 20% 80%, hsla(168, 80%, 40%, 0.18) 0%, transparent 55%)',
          }}
        />
        
        {/* Secondary green glow - bottom right */}
        <div 
          className="absolute bottom-0 right-0 w-[60%] h-[55%]"
          style={{
            background: 'radial-gradient(ellipse at 80% 85%, hsla(145, 70%, 35%, 0.14) 0%, transparent 50%)',
          }}
        />
        
        {/* Top ambient glow */}
        <div 
          className="absolute top-0 left-1/3 w-[50%] h-[40%]"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsla(160, 50%, 25%, 0.08) 0%, transparent 60%)',
          }}
        />
        
        {/* Vignette overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, hsla(160, 35%, 2%, 0.6) 100%)',
          }}
        />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content - Two floating panels */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-8 h-[calc(100vh-80px)] max-h-[900px]">
          
          {/* Left Panel - AI Chat (Floating Glass) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 lg:w-[62%] lg:flex-none flex flex-col floating-glass-panel"
          >
            {children}
          </motion.div>

          {/* Soft gradient glow between panels (desktop only) */}
          <div className="hidden lg:flex items-center justify-center w-8 -mx-2">
            <div 
              className="w-full h-[70%] opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, hsla(168, 80%, 50%, 0.15) 50%, transparent 100%)',
                filter: 'blur(12px)',
              }}
            />
          </div>

          {/* Right Panel - Profile Draft (Floating Glass) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex lg:w-[38%] flex-col floating-glass-panel"
          >
            <ProfileDraftPanel 
              draft={profileDraft}
              showGlow={showProfileGlow}
              onEditBasicDetail={onEditBasicDetail}
              onEditExperience={onEditExperience}
              onRemoveExperience={onRemoveExperience}
              onEditEducation={onEditEducation}
              onRemoveEducation={onRemoveEducation}
              onEditTrait={onEditTrait}
              onRemoveTrait={onRemoveTrait}
              onToggleAnonymous={onToggleAnonymous}
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile floating button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsMobileProfileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full floating-glass-panel border-primary/20 shadow-lg"
        style={{
          boxShadow: '0 4px 24px hsla(168, 80%, 45%, 0.2), 0 0 0 1px hsla(168, 60%, 50%, 0.15)',
        }}
      >
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground font-medium">View profile</span>
      </motion.button>

      {/* Mobile slide-over drawer */}
      <AnimatePresence>
        {isMobileProfileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileProfileOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-[88%] max-w-md z-50"
            >
              <div className="h-full floating-glass-panel rounded-l-3xl rounded-r-none border-r-0">
                <ProfileDraftPanel 
                  draft={profileDraft}
                  showGlow={showProfileGlow}
                  onEditBasicDetail={onEditBasicDetail}
                  onEditExperience={onEditExperience}
                  onRemoveExperience={onRemoveExperience}
                  onEditEducation={onEditEducation}
                  onRemoveEducation={onRemoveEducation}
                  onEditTrait={onEditTrait}
                  onRemoveTrait={onRemoveTrait}
                  onToggleAnonymous={onToggleAnonymous}
                  onClose={() => setIsMobileProfileOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
