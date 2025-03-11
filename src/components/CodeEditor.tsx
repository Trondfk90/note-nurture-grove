
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import LineNumbers from './code-editor/LineNumbers';
import SearchHighlights from './code-editor/SearchHighlights';
import CursorPosition from './code-editor/CursorPosition';
import { useScrollSync } from './code-editor/useScrollSync';
import { useSearchHighlights } from './code-editor/useSearchHighlights';
import { useCursorPosition } from './code-editor/useCursorPosition';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  highlightSearchMatches?: boolean;
  searchQuery?: string;
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
  highlightSearchMatches = false,
  searchQuery = '',
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  
  const { cursorLine, cursorColumn, handleSelect } = useCursorPosition({ value });
  const { searchMatches } = useSearchHighlights({ value, searchQuery, highlightSearchMatches });
  
  // Set up scroll synchronization
  useScrollSync({ 
    textareaRef, 
    lineNumbersRef, 
    highlightsRef, 
    editorContainerRef 
  });

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
      const linesBeforeCursor = textBeforePosition.split('\n');
      const cursorLine = linesBeforeCursor.length;
      const cursorColumn = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
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

  // Initial line count
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  // Function to create a textarea with highlighted search matches
  const renderTextAreaWithHighlights = () => {
    if (!highlightSearchMatches || searchMatches.length === 0 || !searchQuery) {
      return (
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
      );
    }

    return (
      <div className="relative flex-1 h-full">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onClick={handleSelect}
          onKeyUp={handleSelect}
          onSelect={handleSelect}
          placeholder={placeholder}
          className="w-full h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 p-2 rounded-none leading-[1.675rem] bg-transparent"
          style={{ minHeight: '100%', zIndex: 2, position: 'relative', caretColor: 'black' }}
          disabled={disabled}
        />
        <div 
          ref={highlightsRef}
          className="absolute top-0 left-0 w-full h-full font-mono text-sm p-2 pointer-events-none whitespace-pre-wrap break-words leading-[1.675rem] text-transparent overflow-auto"
          style={{ zIndex: 1 }}
        >
          <SearchHighlights value={value} searchMatches={searchMatches} />
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={editorContainerRef}
      className={cn("editor-container relative font-mono flex", className)}
      style={{ position: 'relative' }}
    >
      <LineNumbers 
        lineCount={lineCount} 
        cursorLine={cursorLine} 
        scrollTop={textareaRef.current?.scrollTop || 0}
      />
      
      <div className="flex-1" style={{ marginLeft: '3rem' }}>
        {renderTextAreaWithHighlights()}
      </div>
      
      <CursorPosition cursorLine={cursorLine} cursorColumn={cursorColumn} />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
