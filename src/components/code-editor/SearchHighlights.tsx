
import React from 'react';

interface SearchHighlightsProps {
  value: string;
  searchMatches: {start: number, end: number}[];
  scrollContainer?: HTMLElement | null;
}

const SearchHighlights: React.FC<SearchHighlightsProps> = ({ value, searchMatches, scrollContainer }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {searchMatches.map((match, idx) => {
        const beforeMatch = value.substring(0, match.start);
        const matchText = value.substring(match.start, match.end);
        
        // Calculate position for the highlight
        const matchLines = beforeMatch.split('\n');
        const lastLine = matchLines[matchLines.length - 1];
        
        return (
          <span 
            key={idx}
            className="absolute bg-yellow-200 rounded-sm opacity-50" 
            style={{
              top: `calc(1.675rem * ${matchLines.length - 1})`,
              left: `calc(${lastLine.length} * 0.6125rem + 0.5rem)`,
              height: '1.675rem',
              width: `calc(${matchText.length} * 0.6125rem)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default SearchHighlights;
