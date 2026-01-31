import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileDraftPanel } from './ProfileDraftPanel';
import type { ProfileDraft } from './types';

interface ImmersiveOnboardingLayoutProps {
  children: ReactNode;
  profileDraft: ProfileDraft;
  showProfileGlow?: boolean;
  onEditTrait?: (sectionId: string, traitIndex: number) => void;
  onRemoveTrait?: (sectionId: string, traitIndex: number) => void;
}

export const ImmersiveOnboardingLayout = ({
  children,
  profileDraft,
  showProfileGlow = false,
  onEditTrait,
  onRemoveTrait,
}: ImmersiveOnboardingLayoutProps) => {
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  return (
    <div className="min-h-screen metaview-bg overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-metaview-bg-deep via-metaview-bg to-metaview-bg-deep" />
        {/* Teal glow bottom-left */}
        <div 
          className="absolute bottom-0 left-0 w-[60%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse at bottom left, hsla(168, 80%, 45%, 0.12) 0%, transparent 60%)',
          }}
        />
        {/* Green glow bottom-right */}
        <div 
          className="absolute bottom-0 right-0 w-[50%] h-[45%]"
          style={{
            background: 'radial-gradient(ellipse at bottom right, hsla(145, 70%, 40%, 0.1) 0%, transparent 55%)',
          }}
        />
        {/* Subtle vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, hsla(160, 35%, 3%, 0.4) 100%)',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - AI Chat (65% on desktop, full on mobile) */}
        <div className="flex-1 lg:w-[65%] lg:flex-none flex flex-col">
          {children}
        </div>

        {/* Glowing divider (desktop only) */}
        <div className="hidden lg:block w-px relative">
          <div className="metaview-divider-glow absolute inset-0" />
        </div>

        {/* Right Panel - Profile Draft (35% on desktop, slide-over on mobile) */}
        <div className="hidden lg:flex lg:w-[35%] flex-col">
          <ProfileDraftPanel 
            draft={profileDraft}
            showGlow={showProfileGlow}
            onEdit={onEditTrait}
            onRemove={onRemoveTrait}
          />
        </div>

        {/* Mobile floating button */}
        <button
          onClick={() => setIsMobileProfileOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full metaview-card border border-metaview-accent/30"
        >
          <Eye className="w-4 h-4 text-metaview-accent" />
          <span className="text-sm text-metaview-text font-medium">View profile draft</span>
        </button>

        {/* Mobile slide-over */}
        <AnimatePresence>
          {isMobileProfileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileProfileOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 w-[85%] max-w-md z-50"
              >
                <ProfileDraftPanel 
                  draft={profileDraft}
                  showGlow={showProfileGlow}
                  onEdit={onEditTrait}
                  onRemove={onRemoveTrait}
                  onClose={() => setIsMobileProfileOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
