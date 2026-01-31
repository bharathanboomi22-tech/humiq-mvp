import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, EyeOff, Link, FileText, User, Briefcase, GraduationCap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProfileDraft, ExperienceEntry, EducationEntry, ProfileSection } from './types';

interface ProfileDraftPanelProps {
  draft: ProfileDraft;
  showGlow?: boolean;
  onEditBasicDetail?: (field: keyof ProfileDraft['basicDetails']) => void;
  onEditExperience?: (id: string) => void;
  onRemoveExperience?: (id: string) => void;
  onEditEducation?: (id: string) => void;
  onRemoveEducation?: (id: string) => void;
  onEditTrait?: (sectionId: string, traitIndex: number) => void;
  onRemoveTrait?: (sectionId: string, traitIndex: number) => void;
  onClose?: () => void;
  onToggleAnonymous?: () => void;
}

export const ProfileDraftPanel = ({
  draft,
  showGlow = false,
  onEditBasicDetail,
  onEditExperience,
  onRemoveExperience,
  onEditEducation,
  onRemoveEducation,
  onEditTrait,
  onRemoveTrait,
  onClose,
  onToggleAnonymous,
}: ProfileDraftPanelProps) => {
  const hasBasicDetails = draft.basicDetails.fullName || draft.basicDetails.location || 
                          draft.basicDetails.email || draft.basicDetails.contactNumber;
  const hasExperience = draft.experience.length > 0;
  const hasEducation = draft.education.length > 0;
  const hasWorkStyle = draft.workStyle.some(s => s.traits.length > 0);
  const hasEvidence = draft.evidence && draft.evidence.length > 0;
  const hasContent = hasBasicDetails || hasExperience || hasEducation || hasWorkStyle || hasEvidence;

  return (
    <div 
      className={cn(
        "h-full flex flex-col relative overflow-hidden",
        showGlow && "panel-glow-active"
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Profile</h2>
            <span className="text-[11px] text-primary/80 font-medium tracking-wide uppercase">Draft</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground/80 mt-2.5 leading-relaxed">
          As we talk, I'll build a draft of how you work here. You can edit or remove anything at any time.
        </p>
      </div>

      {/* Content - scrollable */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {!hasContent ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div 
              className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'hsla(160, 25%, 12%, 0.6)',
                border: '1px solid hsla(168, 40%, 40%, 0.1)',
              }}
            >
              <FileText className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground/70">
              Your profile will appear here as we chat.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Basic Details Section */}
            {hasBasicDetails && (
              <BasicDetailsSection 
                details={draft.basicDetails}
                onEdit={onEditBasicDetail}
              />
            )}

            {/* Experience Section */}
            {hasExperience && (
              <ExperienceSection 
                experience={draft.experience}
                onEdit={onEditExperience}
                onRemove={onRemoveExperience}
              />
            )}

            {/* Education Section */}
            {hasEducation && (
              <EducationSection 
                education={draft.education}
                onEdit={onEditEducation}
                onRemove={onRemoveEducation}
              />
            )}

            {/* Work Style Section */}
            {hasWorkStyle && (
              <WorkStyleSection 
                sections={draft.workStyle}
                onEdit={onEditTrait}
                onRemove={onRemoveTrait}
              />
            )}

            {/* Evidence Section */}
            {hasEvidence && (
              <EvidenceSection evidence={draft.evidence!} />
            )}
          </>
        )}
      </div>

      {/* Footer - Privacy Toggle */}
      {hasContent && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-border/10">
          <button 
            onClick={onToggleAnonymous}
            className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Keep this anonymous until I say otherwise</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Shared section header component - inline to avoid ref issues with AnimatePresence
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
}

const SectionHeader = ({ icon, title, badge }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 mb-3">
    {icon}
    <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
      {title}
    </h3>
    {badge && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/40 text-muted-foreground/60">
        {badge}
      </span>
    )}
  </div>
);

// Basic Details Section
const BasicDetailsSection = ({ 
  details, 
  onEdit 
}: { 
  details: ProfileDraft['basicDetails'];
  onEdit?: (field: keyof ProfileDraft['basicDetails']) => void;
}) => {
  const fields = [
    { key: 'fullName' as const, label: 'Full Name', value: details.fullName },
    { key: 'location' as const, label: 'Location', value: details.location },
    { key: 'email' as const, label: 'Email', value: details.email },
    { key: 'contactNumber' as const, label: 'Contact', value: details.contactNumber },
  ];

  return (
    <div className="space-y-2">
      <SectionHeader icon={<User className="w-3.5 h-3.5 text-primary/70" />} title="Basic Details" />
      <div className="space-y-1.5">
        {fields.map((field) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/20 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{field.label}</span>
              <p className="text-sm text-foreground/90 truncate">
                {field.value || <span className="text-muted-foreground/50 italic text-xs">Not provided</span>}
              </p>
            </div>
            {onEdit && field.value && (
              <button
                onClick={() => onEdit(field.key)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-secondary/40 transition-all"
              >
                <Edit2 className="w-3 h-3 text-muted-foreground/60" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Experience Section
const ExperienceSection = ({ 
  experience, 
  onEdit, 
  onRemove 
}: { 
  experience: ExperienceEntry[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}) => (
  <div className="space-y-2">
    <SectionHeader icon={<Briefcase className="w-3.5 h-3.5 text-primary/70" />} title="Experience" />
    <div className="space-y-2">
      <AnimatePresence>
        {experience.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group py-2.5 px-3 rounded-xl hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/90 truncate">{entry.role}</p>
                <p className="text-xs text-muted-foreground/70 truncate">{entry.company}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{entry.timeline}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary/40"
                  >
                    <Edit2 className="w-3 h-3 text-muted-foreground/50" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary/40"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground/50" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

// Education Section
const EducationSection = ({ 
  education, 
  onEdit, 
  onRemove 
}: { 
  education: EducationEntry[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}) => (
  <div className="space-y-2">
    <SectionHeader icon={<GraduationCap className="w-3.5 h-3.5 text-primary/70" />} title="Education" />
    <div className="space-y-2">
      <AnimatePresence>
        {education.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group py-2.5 px-3 rounded-xl hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/90 truncate">{entry.program}</p>
                <p className="text-xs text-muted-foreground/70 truncate">{entry.institution}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{entry.timeline}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary/40"
                  >
                    <Edit2 className="w-3 h-3 text-muted-foreground/50" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary/40"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground/50" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

// Work Style Section
const WorkStyleSection = ({ 
  sections, 
  onEdit, 
  onRemove 
}: { 
  sections: ProfileSection[];
  onEdit?: (sectionId: string, traitIndex: number) => void;
  onRemove?: (sectionId: string, traitIndex: number) => void;
}) => (
  <div className="space-y-3">
    <SectionHeader icon={<Brain className="w-3.5 h-3.5 text-primary/70" />} title="Work Style" badge="Draft" />
    {sections.map((section) => {
      if (section.traits.length === 0) return null;
      
      return (
        <div key={section.id} className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide px-1">{section.title}</p>
          <div className="space-y-0.5">
            <AnimatePresence>
              {section.traits.map((trait, idx) => (
                <motion.div
                  key={trait.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    "group flex items-start gap-2.5 py-2 px-3 rounded-xl transition-colors",
                    "hover:bg-secondary/20",
                    trait.isNew && "animate-[highlight-fade_1.5s_ease-out]"
                  )}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      background: 'hsl(var(--primary))',
                      boxShadow: '0 0 6px hsla(168, 80%, 50%, 0.4)',
                    }}
                  />
                  <span className="flex-1 text-xs text-muted-foreground/80 leading-relaxed">
                    {trait.text}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(section.id, idx)}
                        className="p-1 rounded hover:bg-secondary/40"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-muted-foreground/50" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(section.id, idx)}
                        className="p-1 rounded hover:bg-secondary/40"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-muted-foreground/50" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );
    })}
  </div>
);

// Evidence Section
const EvidenceSection = ({ evidence }: { evidence: ProfileDraft['evidence'] }) => (
  <div className="space-y-2">
    <SectionHeader icon={<Link className="w-3.5 h-3.5 text-primary/70" />} title="Evidence" />
    {evidence?.map((item, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-2.5 px-3 rounded-xl hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-start gap-2.5">
          {item.type === 'link' ? (
            <Link className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/90 truncate">
              {item.name}
            </p>
            {item.description && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                Goal: {item.description}
              </p>
            )}
            {item.decision && (
              <p className="text-[10px] text-muted-foreground/60 truncate">
                Decision: {item.decision}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);
