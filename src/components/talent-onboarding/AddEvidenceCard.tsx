import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Upload, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEvidenceCardProps {
  onAddLink: (url: string) => void;
  onAddFile: (file: File) => void;
  onSkip: () => void;
  isProcessing?: boolean;
}

export const AddEvidenceCard = ({ 
  onAddLink, 
  onAddFile, 
  onSkip, 
  isProcessing = false 
}: AddEvidenceCardProps) => {
  const [mode, setMode] = useState<'choice' | 'link' | 'file' | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLinkSubmit = () => {
    if (linkValue.trim()) {
      onAddLink(linkValue.trim());
      setLinkValue('');
      setMode(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddFile(file);
      setMode(null);
    }
  };

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 py-4 pl-5"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Processing...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pl-5 space-y-3"
    >
      <AnimatePresence mode="wait">
        {mode === null && (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Option buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setMode('link')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 border border-primary/10 text-sm text-foreground hover:bg-secondary/70 hover:border-primary/20 transition-all"
              >
                <Link2 className="w-4 h-4 text-primary" />
                Paste a link
              </button>
              <button
                onClick={() => {
                  setMode('file');
                  setTimeout(() => inputRef.current?.click(), 100);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 border border-primary/10 text-sm text-foreground hover:bg-secondary/70 hover:border-primary/20 transition-all"
              >
                <Upload className="w-4 h-4 text-primary" />
                Upload a file
              </button>
            </div>
            
            {/* Microcopy */}
            <p className="text-xs text-muted-foreground/70">
              GitHub, Figma, Docs, PPT, Notion, or anything that shows real work.
            </p>

            {/* Skip option */}
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              I'll add this later
            </button>
          </motion.div>
        )}

        {mode === 'link' && (
          <motion.div
            key="link"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'hsla(160, 25%, 8%, 0.9)',
                  border: '1px solid hsla(168, 40%, 35%, 0.2)',
                }}
              >
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="url"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="Paste URL here..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                />
              </div>
              <button
                onClick={handleLinkSubmit}
                disabled={!linkValue.trim()}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  linkValue.trim() ? "btn-primary" : "bg-secondary/50 text-muted-foreground"
                )}
              >
                Add
              </button>
              <button
                onClick={() => { setMode(null); setLinkValue(''); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'file' && (
          <motion.div
            key="file"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
            />
            <div className="flex items-center gap-2">
              <div 
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                style={{
                  background: 'hsla(160, 25%, 10%, 0.8)',
                  border: '1px dashed hsla(168, 40%, 35%, 0.25)',
                }}
              >
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Click to select file...
                </span>
              </div>
              <button
                onClick={() => setMode(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
