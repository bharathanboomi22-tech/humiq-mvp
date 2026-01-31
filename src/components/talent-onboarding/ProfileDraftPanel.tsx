import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, EyeOff, Link, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProfileDraft, ProfileSection } from './types';

interface ProfileDraftPanelProps {
  draft: ProfileDraft;
  showGlow?: boolean;
  onEdit?: (sectionId: string, traitIndex: number) => void;
  onRemove?: (sectionId: string, traitIndex: number) => void;
  onClose?: () => void;
}

export const ProfileDraftPanel = ({
  draft,
  showGlow = false,
  onEdit,
  onRemove,
  onClose,
}: ProfileDraftPanelProps) => {
  const hasContent = draft.sections.some(s => s.traits.length > 0) || (draft.evidence && draft.evidence.length > 0);

  return (
    <div 
      className={cn(
        "h-full flex flex-col metaview-card border-l border-metaview-border/30",
        showGlow && "metaview-panel-glow"
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-metaview-border/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-metaview-text">Your Profile</h2>
            <span className="text-xs text-metaview-accent font-medium">(Draft)</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-metaview-surface transition-colors"
            >
              <X className="w-5 h-5 text-metaview-text-muted" />
            </button>
          )}
        </div>
        <p className="text-sm text-metaview-text-subtle mt-3 leading-relaxed">
          As we talk, I'll build a draft of how you work here. You can edit or remove anything at any time.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!hasContent ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-metaview-surface flex items-center justify-center">
              <FileText className="w-5 h-5 text-metaview-text-subtle" />
            </div>
            <p className="text-sm text-metaview-text-subtle">
              Your profile will appear here as we chat.
            </p>
          </div>
        ) : (
          <>
            {/* Profile Sections */}
            {draft.sections.map((section) => (
              <ProfileSectionCard
                key={section.id}
                section={section}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}

            {/* Evidence Section */}
            {draft.evidence && draft.evidence.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
                  Evidence
                </h3>
                {draft.evidence.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-metaview-surface/60 border border-metaview-border/20"
                  >
                    <div className="flex items-start gap-3">
                      {item.type === 'link' ? (
                        <Link className="w-4 h-4 text-metaview-accent mt-0.5" />
                      ) : (
                        <FileText className="w-4 h-4 text-metaview-accent mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-metaview-text truncate">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-metaview-text-subtle mt-1">
                            Goal: {item.description}
                          </p>
                        )}
                        {item.decision && (
                          <p className="text-xs text-metaview-text-subtle mt-1">
                            Decision: {item.decision}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Privacy Toggle */}
      {hasContent && (
        <div className="flex-shrink-0 p-6 border-t border-metaview-border/20">
          <button className="flex items-center gap-2 text-sm text-metaview-text-muted hover:text-metaview-text transition-colors">
            <EyeOff className="w-4 h-4" />
            <span>Keep this anonymous until I say otherwise</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface ProfileSectionCardProps {
  section: ProfileSection;
  onEdit?: (sectionId: string, traitIndex: number) => void;
  onRemove?: (sectionId: string, traitIndex: number) => void;
}

const ProfileSectionCard = ({ section, onEdit, onRemove }: ProfileSectionCardProps) => {
  if (section.traits.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
          {section.title}
        </h3>
        {section.isDraft && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-metaview-surface text-metaview-text-subtle">
            Draft
          </span>
        )}
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {section.traits.map((trait, idx) => (
            <motion.div
              key={trait.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group flex items-start gap-3 p-3 rounded-lg transition-colors",
                "hover:bg-metaview-surface/60",
                trait.isNew && "animate-[trait-glow_1.5s_ease-out]"
              )}
            >
              <span className="text-metaview-accent mt-0.5">•</span>
              <span className="flex-1 text-sm text-metaview-text-muted leading-relaxed">
                {trait.text}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(section.id, idx)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(section.id, idx)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
