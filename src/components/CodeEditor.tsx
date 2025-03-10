
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface CodeEditorRef {
  scrollToSearchResult: (position: number, searchQueryLength: number) => void;
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    scrollToSearchResult: (position: number, searchQueryLength: number) => {
      if (!textareaRef.current) return;
      
      // Calculate line number for the position
      const textBeforePosition = value.substring(0, position);
      const linesBeforePosition = textBeforePosition.split('\n');
      const targetLine = linesBeforePosition.length;
      
      // Set selection at the position
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position + searchQueryLength);
      
      // Scroll to make the line visible (centered if possible)
      const lineHeight = 1.675 * 16; // From the CSS
      textareaRef.current.scrollTop = (targetLine - 5) * lineHeight;
      
      // Update cursor position to highlight the line
      setCursorLine(targetLine);
      setCursorColumn(linesBeforePosition[linesBeforePosition.length - 1].length + 1);
    }
  }));

  // Handle textarea changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Count lines and update line numbers
    const lines = newValue.split('\n').length;
    setLineCount(lines);
  };

  // Update cursor position
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const cursorPosition = target.selectionStart;
    
    const textBeforeCursor = value.substring(0, cursorPosition);
    const linesBeforeCursor = textBeforeCursor.split('\n');
    
    setCursorLine(linesBeforeCursor.length);
    setCursorColumn(linesBeforeCursor[linesBeforeCursor.length - 1].length + 1);
  };

  // Handle scroll synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (!textarea || !lineNumbers) return;
    
    // Function to sync line numbers scroll with textarea scroll
    const syncScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };
    
    // Handle all events that might cause scrolling
    textarea.addEventListener('scroll', syncScroll, { passive: true });
    textarea.addEventListener('mousewheel', syncScroll, { passive: true });
    textarea.addEventListener('DOMMouseScroll', syncScroll, { passive: true }); // Firefox
    
    // Also add wheel event to the container to catch all scroll events
    const container = editorContainerRef.current;
    if (container) {
      container.addEventListener('wheel', () => {
        requestAnimationFrame(syncScroll);
      }, { passive: true });
    }
    
    // Initial sync
    syncScroll();
    
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
      textarea.removeEventListener('mousewheel', syncScroll);
      textarea.removeEventListener('DOMMouseScroll', syncScroll);
      if (container) {
        container.removeEventListener('wheel', syncScroll);
      }
    };
  }, []);

  // Initial line count
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  // Create line numbers array
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div 
      ref={editorContainerRef}
      className={cn("editor-container relative font-mono flex", className)}
      style={{ position: 'relative' }}
    >
      <div 
        ref={lineNumbersRef}
        className="line-numbers bg-muted/70 text-muted-foreground p-2 text-right pr-3 overflow-hidden select-none"
        style={{ 
          width: '3rem',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: 'hidden',
          zIndex: 10
        }}
      >
        {lineNumbers.map((num) => (
          <div 
            key={num} 
            className={cn(
              "text-xs leading-[1.675rem]", 
              cursorLine === num && "bg-primary/20 text-primary font-medium"
            )}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex-1" style={{ marginLeft: '3rem' }}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onClick={handleSelect}
          onKeyUp={handleSelect}
          onSelect={handleSelect}
          placeholder={placeholder}
          className="w-full h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 p-2 rounded-none leading-[1.675rem]"
          style={{ minHeight: '100%' }}
          disabled={disabled}
        />
      </div>
      <div className="absolute bottom-2 right-2 bg-muted px-2 py-0.5 text-xs rounded text-muted-foreground">
        Line {cursorLine}, Column {cursorColumn}
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
