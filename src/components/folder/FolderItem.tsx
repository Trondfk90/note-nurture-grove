
import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, Plus, MoreVertical, Trash, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, Note } from '@/types';
import NoteItem from './NoteItem';

interface FolderItemProps {
  folder: Folder;
  notes: Note[];
  isOpen: boolean;
  toggleFolder: (folderId: string) => void;
  currentFolder?: Folder | null;
  currentNote?: Note | null;
  setCurrentFolder: (folderId: string) => void;
  setCurrentNote: (noteId: string) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (folderId: string) => void;
  handleDeleteNote: (noteId: string) => void;
  handleRenameNote: (noteId: string) => void;
  openMoveNoteDialog: (noteId: string) => void;
  setNewNoteDialogOpen: (open: boolean) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  notes,
  isOpen,
  toggleFolder,
  currentFolder,
  currentNote,
  setCurrentFolder,
  setCurrentNote,
  updateFolder,
  deleteFolder,
  handleDeleteNote,
  handleRenameNote,
  openMoveNoteDialog,
  setNewNoteDialogOpen,
}) => {
  const [renamingFolder, setRenamingFolder] = useState<boolean>(false);
  const [renameFolderValue, setRenameFolderValue] = useState(folder.name);

  const handleRenameFolder = () => {
    setRenamingFolder(true);
    setRenameFolderValue(folder.name);
  };

  const handleSaveRenameFolder = () => {
    if (renameFolderValue.trim()) {
      updateFolder({ 
        ...folder, 
        name: renameFolderValue 
      });
    }
    setRenamingFolder(false);
  };

  const handleDeleteFolder = () => {
    if (window.confirm("Are you sure you want to delete this folder and all its notes?")) {
      deleteFolder(folder.id);
    }
  };

  const folderNotes = notes.filter(note => note.folderId === folder.id);

  return (
    <div key={folder.id} className="mb-1">
      <div
        className={cn(
          "flex items-center p-2 rounded-md hover:bg-sidebar-accent group",
          currentFolder?.id === folder.id && "bg-sidebar-accent",
        )}
        onClick={() => {
          setCurrentFolder(folder.id);
          toggleFolder(folder.id);
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 mr-1 p-0 hover:bg-transparent",
            "text-sidebar-foreground group-hover:text-black",
            currentFolder?.id === folder.id && "text-black"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleFolder(folder.id);
          }}
        >
          {isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </Button>
        <FolderIcon 
          size={16} 
          className={cn(
            "mr-2",
            "text-sidebar-foreground group-hover:text-black",
            currentFolder?.id === folder.id && "text-black"
          )} 
        />
        
        {renamingFolder ? (
          <div className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={renameFolderValue}
              onChange={(e) => setRenameFolderValue(e.target.value)}
              className="h-7 text-sm py-0 px-1 flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRenameFolder();
                if (e.key === 'Escape') setRenamingFolder(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-1 p-0"
              onClick={handleSaveRenameFolder}
            >
              <Check size={14} className="text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={() => setRenamingFolder(false)}
            >
              <X size={14} className="text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <span className={cn(
              "text-sm truncate flex-1",
              "text-sidebar-foreground group-hover:text-black",
              currentFolder?.id === folder.id && "text-black"
            )}>
              {folder.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-sidebar-accent/50",
                    "text-sidebar-foreground group-hover:text-black",
                    currentFolder?.id === folder.id && "text-black"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleRenameFolder}>
                  <Edit size={14} className="mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={handleDeleteFolder}
                >
                  <Trash size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {isOpen && (
        <div className="ml-4 pl-2 border-l border-sidebar-border">
          {folderNotes.length > 0 ? (
            <>
              {folderNotes.map((note) => (
                <NoteItem 
                  key={note.id}
                  note={note}
                  currentNote={currentNote}
                  setCurrentNote={setCurrentNote}
                  handleDeleteNote={handleDeleteNote}
                  handleRenameNote={handleRenameNote}
                  openMoveNoteDialog={openMoveNoteDialog}
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-sidebar-foreground hover:text-black flex items-center justify-center"
                onClick={() => setNewNoteDialogOpen(true)}
              >
                <Plus size={14} className="mr-1" />
                New Note
              </Button>
            </>
          ) : (
            <>
              <div className="py-2 px-2 text-sm text-sidebar-foreground/60 italic">
                No notes yet
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-sidebar-foreground hover:text-black flex items-center justify-center"
                onClick={() => setNewNoteDialogOpen(true)}
              >
                <Plus size={14} className="mr-1" />
                New Note
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderItem;
