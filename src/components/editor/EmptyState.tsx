
import React from 'react';
import { Folder } from '@/types';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  currentFolder: Folder | null;
  setIsCreatingNewNote: (isCreating: boolean) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  currentFolder, 
  setIsCreatingNewNote 
}) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-secondary/30">
      <div className="text-center">
        <h3 className="text-lg font-medium">No note selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Select a note from the sidebar or create a new one.
        </p>
        {currentFolder && (
          <button
            onClick={() => setIsCreatingNewNote(true)}
            className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
          >
            Create New Note
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
