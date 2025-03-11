
import React from 'react';

interface SearchHighlightsProps {
  value: string;
  searchMatches: {start: number, end: number}[];
}

const SearchHighlights: React.FC<SearchHighlightsProps> = ({ value, searchMatches }) => {
  return (
    <>
      {searchMatches.map((match, idx) => {
        const beforeMatch = value.substring(0, match.start);
        const matchText = value.substring(match.start, match.end);
        
        // Calculate position for the highlight
        const matchLines = beforeMatch.split('\n');
        const lastLine = matchLines[matchLines.length - 1];
        
        return (
          <span 
            key={idx}
            className="absolute bg-yellow-200 rounded-sm" 
            style={{
              top: `calc(1.675rem * ${matchLines.length - 1})`,
              left: `calc(${lastLine.length} * 0.6125rem + 0.5rem)`,
              height: '1.675rem',
              width: `calc(${matchText.length} * 0.6125rem)`,
              opacity: 0.5
            }}
          />
        );
      })}
    </>
  );
};

export default SearchHighlights;
