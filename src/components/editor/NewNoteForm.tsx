
import React from 'react';
import { Button } from '@/components/ui/button';

interface NewNoteFormProps {
  newNoteTitle: string;
  setNewNoteTitle: (title: string) => void;
  handleCreateNewNote: () => void;
  setIsCreatingNewNote: (isCreating: boolean) => void;
}

const NewNoteForm: React.FC<NewNoteFormProps> = ({
  newNoteTitle,
  setNewNoteTitle,
  handleCreateNewNote,
  setIsCreatingNewNote,
}) => {
  return (
    <div className="flex flex-col h-full p-4 bg-secondary/30">
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium mb-4">Create a New Note</h3>
        <div className="w-full max-w-md">
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Note title"
            className="w-full p-2 rounded border mb-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newNoteTitle.trim()) {
                handleCreateNewNote();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreatingNewNote(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNewNote}
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              disabled={!newNoteTitle.trim()}
            >
              Create Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewNoteForm;
