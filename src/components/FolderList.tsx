
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import FolderItem from './folder/FolderItem';
import NewFolderDialog from './folder/NewFolderDialog';
import NewNoteDialog from './folder/NewNoteDialog';
import MoveNoteDialog from './folder/MoveNoteDialog';

const FolderList: React.FC = () => {
  const {
    folders,
    currentFolder,
    currentNote,
    setCurrentFolder,
    setCurrentNote,
    createFolder,
    createNote,
    updateFolder,
    deleteFolder,
    updateNote,
    deleteNote,
    moveNote,
    notes
  } = useAppContext();

  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [moveNoteDialogOpen, setMoveNoteDialogOpen] = useState(false);
  const [movingNoteId, setMovingNoteId] = useState<string | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [renamingNote, setRenamingNote] = useState<string | null>(null);
  const [renameNoteValue, setRenameNoteValue] = useState('');

  const toggleFolder = (folderId: string) => {
    setIsOpen((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName, `/Quillboard/${newFolderName}`);
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  const handleCreateNote = () => {
    if (newNoteName.trim() && currentFolder) {
      const defaultContent = `# ${newNoteName}\n\nStart writing your note here...`;
      createNote(currentFolder.id, newNoteName, defaultContent);
      setNewNoteName('');
      setNewNoteDialogOpen(false);
      
      setIsOpen((prev) => ({
        ...prev,
        [currentFolder.id]: true,
      }));
    }
  };

  const handleRenameNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setRenamingNote(noteId);
      setRenameNoteValue(note.title);
    }
  };

  const handleSaveRenameNote = (noteId: string) => {
    if (renameNoteValue.trim()) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        updateNote({ 
          ...note, 
          title: renameNoteValue
        });
        toast({
          title: "Note renamed",
          description: `Note has been renamed to ${renameNoteValue}`,
        });
      }
    }
    setRenamingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
    }
  };

  const openMoveNoteDialog = (noteId: string) => {
    setMovingNoteId(noteId);
    setTargetFolderId('');
    setMoveNoteDialogOpen(true);
  };

  const handleMoveNote = () => {
    if (movingNoteId && targetFolderId && targetFolderId !== '') {
      moveNote(movingNoteId, targetFolderId);
      setMoveNoteDialogOpen(false);
      setMovingNoteId(null);
      setTargetFolderId('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
        <h2 className="font-semibold text-lg">Folders</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setNewFolderDialogOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              notes={notes}
              isOpen={!!isOpen[folder.id]}
              toggleFolder={toggleFolder}
              currentFolder={currentFolder}
              currentNote={currentNote}
              setCurrentFolder={setCurrentFolder}
              setCurrentNote={setCurrentNote}
              updateFolder={updateFolder}
              deleteFolder={deleteFolder}
              handleDeleteNote={handleDeleteNote}
              handleRenameNote={handleRenameNote}
              openMoveNoteDialog={openMoveNoteDialog}
              setNewNoteDialogOpen={setNewNoteDialogOpen}
            />
          ))}
        </div>
      </ScrollArea>

      <NewFolderDialog
        open={newFolderDialogOpen}
        onOpenChange={setNewFolderDialogOpen}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onCreateFolder={handleCreateFolder}
      />

      <NewNoteDialog
        open={newNoteDialogOpen}
        onOpenChange={setNewNoteDialogOpen}
        noteName={newNoteName}
        setNoteName={setNewNoteName}
        onCreateNote={handleCreateNote}
      />

      <MoveNoteDialog
        open={moveNoteDialogOpen}
        onOpenChange={setMoveNoteDialogOpen}
        folders={folders}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        onMoveNote={handleMoveNote}
      />
    </div>
  );
};

export default FolderList;
