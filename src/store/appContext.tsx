import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, Note, Tag, ViewMode } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AppContextType {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
  currentFolder: Folder | null;
  currentNote: Note | null;
  currentTags: string[];
  viewMode: ViewMode;
  isEditing: boolean;
  searchQuery: string;
  createFolder: (name: string, path: string) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (folderId: string) => void;
  createNote: (folderId: string, title: string, content?: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  setCurrentNote: (noteId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsEditing: (editing: boolean) => void;
  addTag: (name: string, color: string) => void;
  updateTag: (tagId: string, name: string, color: string) => void;
  removeTag: (tagId: string) => void;
  addTagToNote: (noteId: string, tagName: string) => void;
  removeTagFromNote: (noteId: string, tagName: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (noteId: string) => void;
  filteredNotes: Note[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_FOLDER: Folder = {
  id: 'demo-folder',
  name: 'Getting Started',
  path: '/demo',
  notes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const WELCOME_NOTE: Note = {
  id: 'welcome-note',
  title: 'Welcome to Notable',
  content: `# Welcome to Notable ✨

Notes are written in [GitHub-flavored Markdown](https://guides.github.com/features/mastering-markdown/), so you can write emojis (":joy:" → :joy:), ~~strikethrough~~ text etc. in a familiar fashion, additionally you can also write subscript~example~ and superscript^example^.

[^1]: This is a footnote, you don't need to manually write it at the bottom of the document.

This also means that your notes aren't locked into any proprietary format.

Notes can have some metadata: if they are favorited or not, which tags they have, which attachments they have, etc. These metadata are written as Markdown front matter. This is taken care of for you.

## Syntax Plugins

Some syntax plugins for providing you [KaTeX](https://katex.org/), [AsciiMath](http://asciimath.org) and [Mermaid](https://github.com/knsv/mermaid) support are built-in.

### KaTeX

Wrap a formula in \`$$\` to display it as a block:

$$f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2 \\pi i \\xi x} \\,d\\xi$$

Multi-line block formulas are supported too:

$$
\\begin{matrix}
  f(\\alpha) & b     & c \\\\
  e          & f(\\beta) & g \\\\
  i          & j     & f(\\gamma)
\\end{matrix}
$$

Wrap it in \`$\` to display it inline: $e^{ipi} + 1 = 0$.

### AsciiMath

Wrap a formula in \`\\$\$\` to display it as a block:

$$sum_(i=1)^n i^3=((n(n+1))/2)^2$$

Wrap it in \`\\$\` to display it inline: $e = mc^2$.

### Mermaid

\`\`\`mermaid
graph TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[Car]
\`\`\`

### Code Highlighting

\`\`\`javascript
// This is a code block with syntax highlighting
function sayHello(name) {
  console.log(\`Hello, \${name}!\`);
}

sayHello('world');
\`\`\`

## Create Your First Note

Click the "+" button to create a new note and start writing!
`,
  tags: ['tutorial', 'markdown'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: true,
};

const INITIAL_TAGS: Tag[] = [
  { id: uuidv4(), name: 'tutorial', color: '#4CAF50' },
  { id: uuidv4(), name: 'markdown', color: '#2196F3' },
  { id: uuidv4(), name: 'important', color: '#F44336' },
  { id: uuidv4(), name: 'ideas', color: '#9C27B0' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([DEMO_FOLDER]);
  const [notes, setNotes] = useState<Note[]>([WELCOME_NOTE]);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [currentFolder, setCurrentFolderState] = useState<Folder | null>(DEMO_FOLDER);
  const [currentNote, setCurrentNoteState] = useState<Note | null>(WELCOME_NOTE);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  useEffect(() => {
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === DEMO_FOLDER.id) {
          return {
            ...folder,
            notes: [WELCOME_NOTE],
          };
        }
        return folder;
      });
    });
  }, []);

  const createFolder = (name: string, path: string) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      path,
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFolders([...folders, newFolder]);
    setCurrentFolderState(newFolder);
    toast({
      title: 'Folder Created',
      description: `${name} folder has been created successfully.`,
    });
  };

  const updateFolder = (updatedFolder: Folder) => {
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === updatedFolder.id) {
          return updatedFolder;
        }
        return folder;
      });
    });

    if (currentFolder?.id === updatedFolder.id) {
      setCurrentFolderState(updatedFolder);
    }
  };

  const deleteFolder = (folderId: string) => {
    const folderToDelete = folders.find((folder) => folder.id === folderId);
    if (!folderToDelete) return;

    const notesToDelete = notes.filter((note) => note.folderId === folderId);
    setNotes((prevNotes) => prevNotes.filter((note) => note.folderId !== folderId));

    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));

    if (currentFolder?.id === folderId) {
      setCurrentFolderState(null);
      setCurrentNoteState(null);
    }

    toast({
      title: 'Folder Deleted',
      description: `${folderToDelete.name} and all its notes have been deleted.`,
    });
  };

  const createNote = (folderId: string, title: string, content = '') => {
    const newNote: Note = {
      id: uuidv4(),
      title,
      content,
      tags: [],
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      favorite: false,
    };

    setNotes([...notes, newNote]);
    
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            notes: [...folder.notes, newNote],
            updatedAt: new Date(),
          };
        }
        return folder;
      });
    });

    setCurrentNoteState(newNote);
    setIsEditing(true);
    toast({
      title: 'Note Created',
      description: `${title} has been created successfully.`,
    });
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === updatedNote.id) {
          return {
            ...updatedNote,
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === updatedNote.folderId) {
          return {
            ...folder,
            notes: folder.notes.map((note) => {
              if (note.id === updatedNote.id) {
                return {
                  ...updatedNote,
                  updatedAt: new Date(),
                };
              }
              return note;
            }),
            updatedAt: new Date(),
          };
        }
        return folder;
      });
    });

    if (currentNote?.id === updatedNote.id) {
      setCurrentNoteState(updatedNote);
    }
  };

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find((note) => note.id === noteId);
    if (!noteToDelete) return;

    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === noteToDelete.folderId) {
          return {
            ...folder,
            notes: folder.notes.filter((note) => note.id !== noteId),
            updatedAt: new Date(),
          };
        }
        return folder;
      });
    });

    if (currentNote?.id === noteId) {
      setCurrentNoteState(null);
    }

    toast({
      title: 'Note Deleted',
      description: `${noteToDelete.title} has been deleted.`,
    });
  };

  const setCurrentFolder = (folderId: string | null) => {
    const folder = folderId ? folders.find((f) => f.id === folderId) || null : null;
    setCurrentFolderState(folder);
    
    if (currentFolder?.id !== folderId) {
      setCurrentNoteState(null);
    }
  };

  const setCurrentNote = (noteId: string | null) => {
    const note = noteId ? notes.find((n) => n.id === noteId) || null : null;
    setCurrentNoteState(note);
  };

  const addTag = (name: string, color: string) => {
    const newTag: Tag = {
      id: uuidv4(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      color,
    };

    setTags([...tags, newTag]);
    toast({
      title: 'Tag Created',
      description: `Tag "${newTag.name}" has been created.`,
    });
  };

  const updateTag = (tagId: string, name: string, color: string) => {
    const tagToUpdate = tags.find((tag) => tag.id === tagId);
    if (!tagToUpdate) return;

    const oldTagName = tagToUpdate.name;
    const newTagName = name.toLowerCase().replace(/\s+/g, '-');

    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === tagId) {
          return {
            ...tag,
            name: newTagName,
            color,
          };
        }
        return tag;
      });
    });

    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.tags.includes(oldTagName)) {
          return {
            ...note,
            tags: note.tags.map((tag) => (tag === oldTagName ? newTagName : tag)),
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.tags.includes(oldTagName)) {
            return {
              ...note,
              tags: note.tags.map((tag) => (tag === oldTagName ? newTagName : tag)),
              updatedAt: new Date(),
            };
          }
          return note;
        });

        return {
          ...folder,
          notes: updatedNotes,
        };
      });
    });

    if (currentNote && currentNote.tags.includes(oldTagName)) {
      setCurrentNoteState({
        ...currentNote,
        tags: currentNote.tags.map((tag) => (tag === oldTagName ? newTagName : tag)),
        updatedAt: new Date(),
      });
    }

    toast({
      title: 'Tag Updated',
      description: `Tag "${oldTagName}" has been updated to "${newTagName}".`,
    });
  };

  const removeTag = (tagId: string) => {
    const tagToRemove = tags.find((tag) => tag.id === tagId);
    if (!tagToRemove) return;

    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.tags.includes(tagToRemove.name)) {
          return {
            ...note,
            tags: note.tags.filter((tag) => tag !== tagToRemove.name),
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.tags.includes(tagToRemove.name)) {
            return {
              ...note,
              tags: note.tags.filter((tag) => tag !== tagToRemove.name),
              updatedAt: new Date(),
            };
          }
          return note;
        });

        return {
          ...folder,
          notes: updatedNotes,
        };
      });
    });

    toast({
      title: 'Tag Removed',
      description: `Tag "${tagToRemove.name}" has been removed.`,
    });
  };

  const addTagToNote = (noteId: string, tagName: string) => {
    const formattedTagName = tagName.toLowerCase().replace(/\s+/g, '-');

    if (!tags.some((tag) => tag.name === formattedTagName)) {
      const colors = ['#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#FF9800', '#795548', '#607D8B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addTag(formattedTagName, randomColor);
    }

    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === noteId && !note.tags.includes(formattedTagName)) {
          return {
            ...note,
            tags: [...note.tags, formattedTagName],
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.id === noteId && !note.tags.includes(formattedTagName)) {
            return {
              ...note,
              tags: [...note.tags, formattedTagName],
              updatedAt: new Date(),
            };
          }
          return note;
        });

        return {
          ...folder,
          notes: updatedNotes,
        };
      });
    });

    if (currentNote?.id === noteId) {
      setCurrentNoteState((prevNote) => {
        if (prevNote && !prevNote.tags.includes(formattedTagName)) {
          return {
            ...prevNote,
            tags: [...prevNote.tags, formattedTagName],
            updatedAt: new Date(),
          };
        }
        return prevNote;
      });
    }
  };

  const removeTagFromNote = (noteId: string, tagName: string) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            tags: note.tags.filter((tag) => tag !== tagName),
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              tags: note.tags.filter((tag) => tag !== tagName),
              updatedAt: new Date(),
            };
          }
          return note;
        });

        return {
          ...folder,
          notes: updatedNotes,
        };
      });
    });

    if (currentNote?.id === noteId) {
      setCurrentNoteState((prevNote) => {
        if (prevNote) {
          return {
            ...prevNote,
            tags: prevNote.tags.filter((tag) => tag !== tagName),
            updatedAt: new Date(),
          };
        }
        return prevNote;
      });
    }
  };

  const toggleFavorite = (noteId: string) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            favorite: !note.favorite,
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              favorite: !note.favorite,
              updatedAt: new Date(),
            };
          }
          return note;
        });

        return {
          ...folder,
          notes: updatedNotes,
        };
      });
    });

    if (currentNote?.id === noteId) {
      setCurrentNoteState((prevNote) => {
        if (prevNote) {
          return {
            ...prevNote,
            favorite: !prevNote.favorite,
            updatedAt: new Date(),
          };
        }
        return prevNote;
      });
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTags =
      currentTags.length > 0
        ? currentTags.every((tag) => note.tags.includes(tag))
        : true;

    const matchesFolder = currentFolder ? note.folderId === currentFolder.id : true;

    return matchesSearch && matchesTags && matchesFolder;
  });

  const value = {
    folders,
    notes,
    tags,
    currentFolder,
    currentNote,
    currentTags,
    viewMode,
    isEditing,
    searchQuery,
    createFolder,
    updateFolder,
    deleteFolder,
    createNote,
    updateNote,
    deleteNote,
    setCurrentFolder,
    setCurrentNote,
    setViewMode,
    setIsEditing,
    addTag,
    updateTag,
    removeTag,
    addTagToNote,
    removeTagFromNote,
    setSearchQuery,
    toggleFavorite,
    filteredNotes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
