
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LineNumbersProps {
  lineCount: number;
  cursorLine: number;
  className?: string;
}

const LineNumbers = forwardRef<HTMLDivElement, LineNumbersProps>(({
  lineCount,
  cursorLine,
  className
}, ref) => {
  // Create line numbers array
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div 
      ref={ref}
      className={cn(
        "line-numbers bg-muted/70 text-muted-foreground p-2 text-right pr-3 select-none",
        className
      )}
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
});

LineNumbers.displayName = 'LineNumbers';

export default LineNumbers;
