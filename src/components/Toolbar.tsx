import React, { useState } from 'react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Folder, KeyboardIcon, Monitor } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SearchOptions } from '@/types';

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
  const [searchOptionsOpen, setSearchOptionsOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeContent: true,
    includeTitles: true,
    includeTags: true,
    caseSensitive: false,
  });

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOptionChange = (option: keyof SearchOptions) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <Monitor className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-xl font-semibold">TFK Notes</h1>
        </div>
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Popover open={searchOptionsOpen} onOpenChange={setSearchOptionsOpen}>
            <Input
              placeholder="Search notes, folders, tags... (Ctrl+K or /)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 pr-10 h-9"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <KeyboardIcon className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Search options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <PopoverContent className="w-60">
              <div className="space-y-3">
                <h4 className="font-medium">Search Options</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-titles">Include titles</Label>
                  <Switch 
                    id="include-titles" 
                    checked={searchOptions.includeTitles}
                    onCheckedChange={() => handleOptionChange('includeTitles')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-content">Include content</Label>
                  <Switch 
                    id="include-content" 
                    checked={searchOptions.includeContent}
                    onCheckedChange={() => handleOptionChange('includeContent')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-tags">Include tags</Label>
                  <Switch 
                    id="include-tags" 
                    checked={searchOptions.includeTags}
                    onCheckedChange={() => handleOptionChange('includeTags')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="case-sensitive">Case sensitive</Label>
                  <Switch 
                    id="case-sensitive" 
                    checked={searchOptions.caseSensitive}
                    onCheckedChange={() => handleOptionChange('caseSensitive')}
                  />
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+K</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded">/</kbd> to open search dialog
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewFolderDialogOpen(true)}
          className="text-xs"
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
