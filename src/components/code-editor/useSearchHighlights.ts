
import { useEffect, useState } from 'react';

interface UseSearchHighlightsProps {
  value: string;
  searchQuery: string;
  highlightSearchMatches: boolean;
}

export const useSearchHighlights = ({
  value,
  searchQuery,
  highlightSearchMatches
}: UseSearchHighlightsProps) => {
  const [searchMatches, setSearchMatches] = useState<{start: number, end: number}[]>([]);
  
  // Function to find all search matches
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '' && highlightSearchMatches) {
      const matches: {start: number, end: number}[] = [];
      const query = searchQuery.toLowerCase();
      const content = value.toLowerCase();
      let index = 0;
      
      while (index < content.length) {
        const foundIndex = content.indexOf(query, index);
        if (foundIndex === -1) break;
        
        matches.push({
          start: foundIndex,
          end: foundIndex + query.length
        });
        
        index = foundIndex + query.length;
      }
      
      setSearchMatches(matches);
    } else {
      setSearchMatches([]);
    }
  }, [searchQuery, value, highlightSearchMatches]);

  return { searchMatches };
};
