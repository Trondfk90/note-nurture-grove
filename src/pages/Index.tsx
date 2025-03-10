
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from '@/store/appContext';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import FolderList from '@/components/FolderList';
import NoteEditor from '@/components/NoteEditor';
import Toolbar from '@/components/Toolbar';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { File, Folder, Hash, KeyboardIcon } from 'lucide-react';

// Search component that will be used inside the provider
const SearchCommandPalette = () => {
  const {
    notes,
    folders,
    tags,
    setCurrentFolder,
    setCurrentNote,
    setSearchQuery,
  } = useAppContext();
  
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

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

  const filteredNotes = notes.filter((note) => 
    note.title.toLowerCase().includes(searchInput.toLowerCase()) || 
    note.content.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  const filteredFolders = folders.filter((folder) => 
    folder.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  const filteredTags = tags.filter((tag) => 
    tag.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    (tag.displayName && tag.displayName.toLowerCase().includes(searchInput.toLowerCase()))
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

  // Check if there's content in the search results
  const hasSearchResults = filteredNotes.length > 0 || filteredFolders.length > 0 || filteredTags.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search notes, folders, tags..."
        value={searchInput}
        onValueChange={setSearchInput}
        autoFocus
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
                          #{tag?.displayName || tagName}
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
                  #{tag.displayName || tag.name}
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
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Toolbar />
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 bg-background"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="bg-sidebar"
          >
            <FolderList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <NoteEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
        <SearchCommandPalette />
      </div>
    </AppProvider>
  );
};

export default Index;
