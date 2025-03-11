
import React, { useState } from 'react';
import { FileText, Star, Edit, MoreVertical, Trash, Move, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Note } from '@/types';

interface NoteItemProps {
  note: Note;
  currentNote?: Note | null;
  setCurrentNote: (noteId: string) => void;
  handleDeleteNote: (noteId: string) => void;
  handleRenameNote: (noteId: string) => void;
  openMoveNoteDialog: (noteId: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  currentNote,
  setCurrentNote,
  handleDeleteNote,
  handleRenameNote,
  openMoveNoteDialog,
}) => {
  const [renamingNote, setRenamingNote] = useState<boolean>(false);
  const [renameNoteValue, setRenameNoteValue] = useState(note.title);

  const handleSaveRenameNote = () => {
    if (renameNoteValue.trim()) {
      handleRenameNote(note.id);
    }
    setRenamingNote(false);
  };

  const startRenameNote = () => {
    setRenamingNote(true);
    setRenameNoteValue(note.title);
  };

  return (
    <div
      key={note.id}
      className={cn(
        "flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent/50 text-sm group",
        currentNote?.id === note.id && "bg-sidebar-accent/50"
      )}
      onClick={() => setCurrentNote(note.id)}
    >
      <FileText size={14} className="mr-2 text-sidebar-foreground" />
      
      {renamingNote ? (
        <div className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={renameNoteValue}
            onChange={(e) => setRenameNoteValue(e.target.value)}
            className="h-7 text-sm py-0 px-1 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRenameNote();
              if (e.key === 'Escape') setRenamingNote(false);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 p-0"
            onClick={handleSaveRenameNote}
          >
            <Check size={14} className="text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => setRenamingNote(false)}
          >
            <X size={14} className="text-red-600" />
          </Button>
        </div>
      ) : (
        <>
          <span className="truncate flex-1 text-sidebar-foreground">{note.title}</span>
          {note.favorite && (
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-sidebar-accent/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={startRenameNote}>
                <Edit size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openMoveNoteDialog(note.id)}>
                <Move size={14} className="mr-2" />
                Move to folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600" 
                onClick={() => handleDeleteNote(note.id)}
              >
                <Trash size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default NoteItem;
