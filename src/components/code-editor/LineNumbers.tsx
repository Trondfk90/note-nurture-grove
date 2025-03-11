
import React from 'react';
import { cn } from '@/lib/utils';

interface LineNumbersProps {
  lineCount: number;
  cursorLine: number;
  scrollTop: number;
}

const LineNumbers: React.FC<LineNumbersProps> = ({ 
  lineCount, 
  cursorLine,
  scrollTop
}) => {
  // Create line numbers array
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div 
      className="line-numbers bg-muted/70 text-muted-foreground p-2 text-right pr-3 overflow-hidden select-none"
      style={{ 
        width: '3rem',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        overflowY: 'hidden',
        zIndex: 10,
        transform: `translateY(-${scrollTop}px)`
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
  );
};

export default LineNumbers;
