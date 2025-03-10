
import React, { useState } from 'react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Toolbar: React.FC = () => {
  const {
    createFolder,
    createNote,
    currentFolder,
    setSearchQuery,
    searchQuery,
  } = useAppContext();

  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');

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
    <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold mr-6">Notable</h1>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewFolderDialogOpen(true)}
          className={cn("text-xs", !currentFolder && "pointer-events-none opacity-50")}
        >
          <Folder className="h-4 w-4 mr-1" />
          New Folder
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => setNewNoteDialogOpen(true)}
          className={cn("text-xs", !currentFolder && "pointer-events-none opacity-50")}
          disabled={!currentFolder}
        >
          <FileText className="h-4 w-4 mr-1" />
          New Note
        </Button>
      </div>

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

export default Toolbar;
