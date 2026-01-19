import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  onSnapshot?: (code: string) => void;
  snapshotDebounceMs?: number;
}

// Simple code editor using Textarea with monospace font
// For MVP, we use a styled textarea instead of Monaco for simplicity
export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  placeholder = 'Write your code or pseudocode here...',
  className,
  onSnapshot,
  snapshotDebounceMs = 3000,
}: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string>('');

  // Update line count
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(Math.max(lines, 10));
  }, [value]);

  // Debounced snapshot
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      // Debounce snapshot
      if (onSnapshot) {
        if (snapshotTimeoutRef.current) {
          clearTimeout(snapshotTimeoutRef.current);
        }

        snapshotTimeoutRef.current = setTimeout(() => {
          // Only snapshot if content changed
          if (newValue !== lastSnapshotRef.current && newValue.trim()) {
            lastSnapshotRef.current = newValue;
            onSnapshot(newValue);
          }
        }, snapshotDebounceMs);
      }
    },
    [onChange, onSnapshot, snapshotDebounceMs]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      handleChange(newValue);
      
      // Move cursor after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      {/* Language badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-muted rounded text-muted-foreground">
          {language}
        </span>
      </div>

      {/* Line numbers + Editor */}
      <div className="flex">
        {/* Line numbers */}
        <div className="flex-shrink-0 py-3 px-2 bg-muted/50 border-r border-border select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className="text-xs text-muted-foreground text-right leading-6 font-mono"
              style={{ minWidth: '2ch' }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 min-h-[300px] resize-none border-0 rounded-none',
            'font-mono text-sm leading-6 py-3 px-3',
            'bg-card/50 focus-visible:ring-0 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground/50'
          )}
          style={{ lineHeight: '24px' }}
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-t border-border text-xs text-muted-foreground">
        <span>Lines: {value.split('\n').length}</span>
        <span>Characters: {value.length}</span>
      </div>
    </div>
  );
}
