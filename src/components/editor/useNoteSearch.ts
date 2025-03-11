
import { useState, useEffect } from 'react';
import { CodeEditorRef } from '@/components/CodeEditor';

export const useNoteSearch = (editedContent: string, textareaRef: React.RefObject<CodeEditorRef>) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{index: number, line: number}[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const handleSearch = () => {
    if (!searchQuery || !editedContent) return;
    
    const query = searchQuery.toLowerCase();
    const content = editedContent.toLowerCase();
    const lines = editedContent.split('\n');
    
    const results: {index: number, line: number}[] = [];
    let currentIndex = 0;
    
    lines.forEach((line, lineIndex) => {
      const lineLower = line.toLowerCase();
      let position = 0;
      
      while (position < lineLower.length) {
        const foundIndex = lineLower.indexOf(query, position);
        if (foundIndex === -1) break;
        
        results.push({
          index: currentIndex + foundIndex,
          line: lineIndex + 1
        });
        
        position = foundIndex + query.length;
      }
      
      currentIndex += line.length + 1;
    });
    
    setSearchResults(results);
    setCurrentSearchIndex(0);
    
    if (results.length > 0) {
      navigateToSearchResult(results[0]);
    }
  };

  const navigateToSearchResult = (result: {index: number, line: number}) => {
    if (!textareaRef.current) return;
    textareaRef.current.scrollToSearchResult(result.index, searchQuery.length);
  };
  
  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    navigateToSearchResult(searchResults[nextIndex]);
  };
  
  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    navigateToSearchResult(searchResults[prevIndex]);
  };

  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return {
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    currentSearchIndex,
    handleSearch,
    nextSearchResult,
    prevSearchResult
  };
};
