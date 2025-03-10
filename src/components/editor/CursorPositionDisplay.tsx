
import React from 'react';

interface CursorPositionDisplayProps {
  line: number;
  column: number;
}

const CursorPositionDisplay: React.FC<CursorPositionDisplayProps> = ({ line, column }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-muted px-2 py-0.5 text-xs rounded text-muted-foreground">
      Line {line}, Column {column}
    </div>
  );
};

export default CursorPositionDisplay;
