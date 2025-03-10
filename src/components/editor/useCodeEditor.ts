
import { useState, useRef, useEffect } from 'react';

interface UseCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface CodeEditorState {
  lineCount: number;
  cursorLine: number;
  cursorColumn: number;
}

export const useCodeEditor = ({ value, onChange }: UseCodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const scrollSyncTimeoutRef = useRef<number | null>(null);

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

  // Initial line count
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  // Scroll to a specific position
  const scrollToPosition = (position: number, selectionLength: number = 0) => {
    if (!textareaRef.current) return;
    
    // Calculate line number for the position
    const textBeforePosition = value.substring(0, position);
    const linesBeforePosition = textBeforePosition.split('\n');
    const targetLine = linesBeforePosition.length;
    
    // Set selection at the position
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(position, position + selectionLength);
    
    // Scroll to make the line visible (centered if possible)
    const lineHeight = 1.675 * 16; // From the CSS
    textareaRef.current.scrollTop = (targetLine - 5) * lineHeight;
    
    // Update cursor position to highlight the line
    setCursorLine(targetLine);
    setCursorColumn(linesBeforePosition[linesBeforePosition.length - 1].length + 1);
  };

  return {
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
  };
};
