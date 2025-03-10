
import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, Plus, FileText, Star, Edit, MoreVertical, Trash, Check, X, Move } from 'lucide-react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  } = useAppContext();

  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [moveNoteDialogOpen, setMoveNoteDialogOpen] = useState(false);
  const [movingNoteId, setMovingNoteId] = useState<string | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renamingNote, setRenamingNote] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState('');
  const [renameNoteValue, setRenameNoteValue] = useState('');

  const toggleFolder = (folderId: string) => {
    setIsOpen((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
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

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setRenamingFolder(folderId);
      setRenameFolderValue(folder.name);
    }
  };

  const handleSaveRenameFolder = (folderId: string) => {
    if (renameFolderValue.trim()) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        updateFolder({ 
          ...folder, 
          name: renameFolderValue,
          updatedAt: new Date() 
        });
        toast({
          title: "Folder renamed",
          description: `Folder has been renamed to ${renameFolderValue}`,
        });
      }
    }
    setRenamingFolder(null);
  };

  const handleRenameNote = (noteId: string) => {
    const note = currentFolder?.notes.find(n => n.id === noteId);
    if (note) {
      setRenamingNote(noteId);
      setRenameNoteValue(note.title);
    }
  };

  const handleSaveRenameNote = (noteId: string) => {
    if (renameNoteValue.trim()) {
      const note = currentFolder?.notes.find(n => n.id === noteId);
      if (note) {
        updateNote({ 
          ...note, 
          title: renameNoteValue,
          updatedAt: new Date() 
        });
        toast({
          title: "Note renamed",
          description: `Note has been renamed to ${renameNoteValue}`,
        });
      }
    }
    setRenamingNote(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm("Are you sure you want to delete this folder and all its notes?")) {
      deleteFolder(folderId);
    }
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
                  {isOpen[folder.id] ? (
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
                
                {renamingFolder === folder.id ? (
                  <div className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={renameFolderValue}
                      onChange={(e) => setRenameFolderValue(e.target.value)}
                      className="h-7 text-sm py-0 px-1 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRenameFolder(folder.id);
                        if (e.key === 'Escape') setRenamingFolder(null);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1 p-0"
                      onClick={() => handleSaveRenameFolder(folder.id)}
                    >
                      <Check size={14} className="text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setRenamingFolder(null)}
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
                        <DropdownMenuItem onClick={() => handleRenameFolder(folder.id)}>
                          <Edit size={14} className="mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              {isOpen[folder.id] && (
                <div className="ml-4 pl-2 border-l border-sidebar-border">
                  {folder.notes.length > 0 ? (
                    <>
                      {folder.notes.map((note) => (
                        <div
                          key={note.id}
                          className={cn(
                            "flex items-center p-2 rounded-md cursor-pointer hover:bg-sidebar-accent/50 text-sm group",
                            currentNote?.id === note.id && "bg-sidebar-accent/50"
                          )}
                          onClick={() => setCurrentNote(note.id)}
                        >
                          <FileText size={14} className="mr-2 text-sidebar-foreground" />
                          
                          {renamingNote === note.id ? (
                            <div className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={renameNoteValue}
                                onChange={(e) => setRenameNoteValue(e.target.value)}
                                className="h-7 text-sm py-0 px-1 flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRenameNote(note.id);
                                  if (e.key === 'Escape') setRenamingNote(null);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 p-0"
                                onClick={() => handleSaveRenameNote(note.id)}
                              >
                                <Check size={14} className="text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => setRenamingNote(null)}
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
                                  <DropdownMenuItem onClick={() => handleRenameNote(note.id)}>
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

      {/* Move Note Dialog */}
      <Dialog open={moveNoteDialogOpen} onOpenChange={setMoveNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move Note to Another Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="folder-select" className="text-sm font-medium">
                Select Destination Folder
              </label>
              <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                <SelectTrigger id="folder-select">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMoveNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleMoveNote}
              disabled={!targetFolderId}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;
