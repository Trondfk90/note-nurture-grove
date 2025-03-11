
import React from 'react';

interface CursorPositionProps {
  cursorLine: number;
  cursorColumn: number;
}

const CursorPosition: React.FC<CursorPositionProps> = ({ cursorLine, cursorColumn }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-muted px-2 py-0.5 text-xs rounded text-muted-foreground">
      Line {cursorLine}, Column {cursorColumn}
    </div>
  );
};

export default CursorPosition;
