
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  prevSearchResult: () => void;
  nextSearchResult: () => void;
  searchResults: Array<{index: number, line: number}>;
  currentSearchIndex: number;
  setShowSearch: (show: boolean) => void;
  setSearchResults: (results: Array<{index: number, line: number}>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  prevSearchResult,
  nextSearchResult,
  searchResults,
  currentSearchIndex,
  setShowSearch,
  setSearchResults
}) => {
  // Handle input change separately to prevent re-rendering issues
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <Input
        placeholder="Search in note..."
        value={searchQuery}
        onChange={handleInputChange}
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        autoFocus
      />
      <Button variant="outline" size="sm" onClick={handleSearch}>
        Search
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={prevSearchResult}
        disabled={searchResults.length === 0}
      >
        Prev
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={nextSearchResult}
        disabled={searchResults.length === 0}
      >
        Next
      </Button>
      {searchResults.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {currentSearchIndex + 1} of {searchResults.length}
        </span>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={() => {
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <X size={16} />
      </Button>
    </div>
  );
};

export default SearchBar;
