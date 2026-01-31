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
        <div className="flex-shrink-0 p-6 border-t border-metaview-border/20">
          <button 
            onClick={onToggleAnonymous}
            className="flex items-center gap-2 text-sm text-metaview-text-muted hover:text-metaview-text transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            <span>Keep this anonymous until I say otherwise</span>
          </button>
        </div>
      )}
    </div>
  );
};

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
    { key: 'contactNumber' as const, label: 'Contact Number', value: details.contactNumber },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-metaview-accent" />
        <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
          Basic Details
        </h3>
      </div>
      <div className="space-y-2">
        {fields.map((field) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center justify-between p-3 rounded-lg bg-metaview-surface/40 border border-metaview-border/10"
          >
            <div className="flex-1">
              <span className="text-xs text-metaview-text-subtle">{field.label}</span>
              <p className="text-sm text-metaview-text mt-0.5">
                {field.value || <span className="text-metaview-text-muted italic">Not provided</span>}
              </p>
            </div>
            {onEdit && (
              <button
                onClick={() => onEdit(field.key)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-metaview-surface transition-all"
              >
                <Edit2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
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
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Briefcase className="w-4 h-4 text-metaview-accent" />
      <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
        Experience
      </h3>
    </div>
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {experience.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group p-3 rounded-lg bg-metaview-surface/40 border border-metaview-border/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-metaview-text">{entry.role}</p>
                <p className="text-sm text-metaview-text-subtle">{entry.company}</p>
                <p className="text-xs text-metaview-text-muted mt-1">{entry.timeline}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(entry.id)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
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
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <GraduationCap className="w-4 h-4 text-metaview-accent" />
      <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
        Education
      </h3>
    </div>
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {education.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group p-3 rounded-lg bg-metaview-surface/40 border border-metaview-border/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-metaview-text">{entry.program}</p>
                <p className="text-sm text-metaview-text-subtle">{entry.institution}</p>
                <p className="text-xs text-metaview-text-muted mt-1">{entry.timeline}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(entry.id)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="p-1.5 rounded hover:bg-metaview-surface"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-metaview-text-subtle" />
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
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Brain className="w-4 h-4 text-metaview-accent" />
      <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
        Work Style
      </h3>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-metaview-surface text-metaview-text-subtle">
        Draft
      </span>
    </div>
    {sections.map((section) => {
      if (section.traits.length === 0) return null;
      
      return (
        <div key={section.id} className="space-y-2">
          <p className="text-xs text-metaview-text-subtle font-medium">{section.title}</p>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {section.traits.map((trait, idx) => (
                <motion.div
                  key={trait.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group flex items-start gap-3 p-2 rounded-lg transition-colors",
                    "hover:bg-metaview-surface/40",
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
                        className="p-1 rounded hover:bg-metaview-surface"
                      >
                        <Edit2 className="w-3 h-3 text-metaview-text-subtle" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(section.id, idx)}
                        className="p-1 rounded hover:bg-metaview-surface"
                      >
                        <Trash2 className="w-3 h-3 text-metaview-text-subtle" />
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
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Link className="w-4 h-4 text-metaview-accent" />
      <h3 className="text-xs uppercase tracking-wider text-metaview-text-muted font-semibold">
        Evidence
      </h3>
    </div>
    {evidence?.map((item, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg bg-metaview-surface/40 border border-metaview-border/10"
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
);
