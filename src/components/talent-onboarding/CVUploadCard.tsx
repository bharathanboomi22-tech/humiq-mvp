import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Edit2, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CVEntry } from './types';

interface CVUploadCardProps {
  onUpload: (file: File) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export const CVUploadCard = ({ onUpload, onSkip, isLoading = false }: CVUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Parsing your CV...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Extracting your experience and education
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
          "flex flex-col items-center justify-center gap-4",
          isDragging 
            ? "border-primary bg-primary/5"
            : "border-border/30 hover:border-primary/40 hover:bg-secondary/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Upload CV
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Word, or text document
          </p>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip, I'll explain it instead
      </button>

      {/* Microcopy */}
      <p className="text-xs text-muted-foreground text-center">
        Optional. You're always in control.
      </p>
    </div>
  );
};

interface CVReviewCardProps {
  entries: CVEntry[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onContinue: () => void;
}

export const CVReviewCard = ({ entries, onEdit, onRemove, onContinue }: CVReviewCardProps) => {
  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-xl glass-card-elevated group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {entry.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {entry.organization}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.startDate} – {entry.endDate || 'Present'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(entry.id)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => onRemove(entry.id)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      <p className="text-xs text-muted-foreground text-center pt-2">
        This is background context only.
      </p>

      <button
        onClick={onContinue}
        className="w-full btn-primary mt-4"
      >
        Continue
      </button>
    </div>
  );
};
