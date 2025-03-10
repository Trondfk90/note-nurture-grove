
import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, Plus, FileText, Star } from 'lucide-react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const FolderList: React.FC = () => {
  const {
    folders,
    currentFolder,
    currentNote,
    setCurrentFolder,
    setCurrentNote,
    createFolder,
    createNote,
  } = useAppContext();

  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');

  const toggleFolder = (folderId: string) => {
    setIsOpen((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // In a real app, you'd pick a path via a file dialog
      // For this demo, we'll just use a dummy path
      createFolder(newFolderName, `/MyNotable/${newFolderName}`);
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  const handleCreateNote = () => {
    if (newNoteName.trim() && currentFolder) {
      createNote(currentFolder.id, newNoteName);
      setNewNoteName('');
      setNewNoteDialogOpen(false);
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
            <div key={folder.id} className="mb-1">
              <div
                className={cn(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent group",
                  currentFolder?.id === folder.id && "bg-sidebar-accent"
                )}
                onClick={() => {
                  setCurrentFolder(folder.id);
                  toggleFolder(folder.id);
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 mr-1 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id);
                  }}
                >
                  {isOpen[folder.id] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </Button>
                <FolderIcon size={16} className="mr-2" />
                <span className="text-sm truncate flex-1">{folder.name}</span>
                {currentFolder?.id === folder.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-sidebar-accent/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewNoteDialogOpen(true);
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                )}
              </div>

              {isOpen[folder.id] && (
                <div className="ml-4 pl-2 border-l border-sidebar-border">
                  {folder.notes.length > 0 ? (
                    folder.notes.map((note) => (
                      <div
                        key={note.id}
                        className={cn(
                          "flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent/50 text-sm",
                          currentNote?.id === note.id && "bg-sidebar-accent/50"
                        )}
                        onClick={() => setCurrentNote(note.id)}
                      >
                        <FileText size={14} className="mr-2" />
                        <span className="truncate flex-1">{note.title}</span>
                        {note.favorite && (
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-2 px-2 text-sm text-sidebar-foreground/60 italic">
                      No notes yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Note Dialog */}
      <Dialog open={newNoteDialogOpen} onOpenChange={setNewNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Note title"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateNote}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;
