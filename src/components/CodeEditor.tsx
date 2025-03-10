
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import LineNumbers from './editor/LineNumbers';
import CursorPositionDisplay from './editor/CursorPositionDisplay';
import { useCodeEditor } from './editor/useCodeEditor';

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
  const {
    textareaRef,
    lineNumbersRef,
    editorContainerRef,
    lineCount,
    cursorLine,
    cursorColumn,
    handleChange,
    handleSelect,
    scrollToPosition,
    scrollSyncTimeoutRef
  } = useCodeEditor({ value, onChange });

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    scrollToSearchResult: (position: number, searchQueryLength: number) => {
      scrollToPosition(position, searchQueryLength);
    }
  }));

  // Handle scroll synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    const container = editorContainerRef.current;
    
    if (!textarea || !lineNumbers || !container) return;
    
    // Function to sync line numbers with textarea
    const syncScroll = () => {
      if (lineNumbers && textarea) {
        lineNumbers.scrollTop = textarea.scrollTop;
      }
    };

    // Set up a continuous sync interval for smoother scrolling
    const startScrollSync = () => {
      if (scrollSyncTimeoutRef.current === null) {
        scrollSyncTimeoutRef.current = window.setInterval(syncScroll, 8);
      }
    };

    const stopScrollSync = () => {
      if (scrollSyncTimeoutRef.current !== null) {
        window.clearInterval(scrollSyncTimeoutRef.current);
        scrollSyncTimeoutRef.current = null;
      }
    };
    
    // Handle all events that might cause scrolling
    textarea.addEventListener('scroll', syncScroll, { passive: true });
    textarea.addEventListener('mouseenter', startScrollSync);
    textarea.addEventListener('mouseleave', stopScrollSync);
    
    // For mouse wheel events on the entire container
    const handleWheel = () => {
      requestAnimationFrame(syncScroll);
    };
    
    container.addEventListener('wheel', handleWheel, { passive: true });
    
    // Initial sync
    syncScroll();
    
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
      textarea.removeEventListener('mouseenter', startScrollSync);
      textarea.removeEventListener('mouseleave', stopScrollSync);
      container.removeEventListener('wheel', handleWheel);
      stopScrollSync();
    };
  }, []);

  return (
    <div 
      ref={editorContainerRef}
      className={cn("editor-container relative font-mono flex", className)}
      style={{ position: 'relative' }}
    >
      <div className="relative flex w-full h-full">
        <div 
          className="absolute left-0 top-0 bottom-0 z-10 overflow-hidden"
          style={{ width: '3rem' }}
        >
          <LineNumbers 
            ref={lineNumbersRef}
            lineCount={lineCount}
            cursorLine={cursorLine}
            className="h-full"
          />
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
        
        <CursorPositionDisplay line={cursorLine} column={cursorColumn} />
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
