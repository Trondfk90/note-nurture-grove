
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from '@/store/appContext';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import FolderList from '@/components/FolderList';
import TagList from '@/components/TagList';
import NoteEditor from '@/components/NoteEditor';
import Toolbar from '@/components/Toolbar';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { File, Folder, Hash, KeyboardIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Search component that will be used inside the provider
const SearchCommandPalette = () => {
  const {
    notes,
    folders,
    tags,
    setCurrentFolder,
    setCurrentNote,
    currentTags,
    setSearchQuery,
  } = useAppContext();
  
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Register keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Filter items based on search input
  const filteredNotes = notes.filter((note) => 
    note.title.toLowerCase().includes(searchInput.toLowerCase()) || 
    note.content.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  const filteredFolders = folders.filter((folder) => 
    folder.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  const filteredTags = tags.filter((tag) => 
    tag.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setCurrentFolder(note.folderId);
      setCurrentNote(noteId);
      setOpen(false);
      setSearchInput('');
    }
  };

  const handleSelectFolder = (folderId: string) => {
    setCurrentFolder(folderId);
    setOpen(false);
    setSearchInput('');
  };

  const handleSelectTag = (tagName: string) => {
    setSearchQuery(tagName);
    setOpen(false);
    setSearchInput('');
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search notes, folders, tags..."
        value={searchInput}
        onValueChange={setSearchInput}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {filteredNotes.length > 0 && (
          <CommandGroup heading="Notes">
            {filteredNotes.map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => handleSelectNote(note.id)}
                className="flex items-center"
              >
                <File className="mr-2 h-4 w-4" />
                <span className="font-medium">{note.title}</span>
                {note.tags.length > 0 && (
                  <div className="ml-2 flex gap-1">
                    {note.tags.map(tagName => {
                      const tag = tags.find(t => t.name === tagName);
                      return (
                        <span 
                          key={tagName}
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: tag ? `${tag.color}20` : undefined,
                            color: tag ? tag.color : undefined,
                          }}
                        >
                          #{tagName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {filteredFolders.length > 0 && (
          <CommandGroup heading="Folders">
            {filteredFolders.map((folder) => (
              <CommandItem
                key={folder.id}
                onSelect={() => handleSelectFolder(folder.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span className="font-medium">{folder.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {filteredTags.length > 0 && (
          <CommandGroup heading="Tags">
            {filteredTags.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => handleSelectTag(tag.name)}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span 
                  className="font-medium"
                  style={{ color: tag.color }}
                >
                  #{tag.name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

const Index: React.FC = () => {
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Toolbar />
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 bg-background"
        >
          <ResizablePanel
            defaultSize={15}
            minSize={10}
            maxSize={25}
            className="bg-sidebar"
          >
            <FolderList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          {isTagsOpen ? (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-2 z-10"
                  onClick={() => setIsTagsOpen(false)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <TagList />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          ) : (
            <div className="w-8 flex items-center justify-center border-r border-l border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsTagsOpen(true)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
          <ResizablePanel defaultSize={isTagsOpen ? 65 : 85}>
            <NoteEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
        <SearchCommandPalette />
      </div>
    </AppProvider>
  );
};

export default Index;
