
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
  setShowSearch: (show: boolean) => void;
  searchResults: { index: number; line: number }[];
  currentSearchIndex: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  prevSearchResult,
  nextSearchResult,
  setShowSearch,
  searchResults,
  currentSearchIndex
}) => {
  return (
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <Input
        placeholder="Search in note..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
        onClick={() => setShowSearch(false)}
      >
        <X size={16} />
      </Button>
    </div>
  );
};

export default SearchBar;
