
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, Note, Tag, ViewMode, Attachment } from '@/types';
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
  moveNote: (noteId: string, targetFolderId: string) => void;
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
  addAttachment: (noteId: string, file: File) => Promise<Attachment>;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
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

Notable is a powerful, yet simple note-taking application that helps you organize your thoughts, ideas, and knowledge in a beautiful interface.

## Key Features

- **Markdown Support**: Write in GitHub-flavored Markdown with support for tables, checkboxes, and more
- **Smart Organization**: Organize notes in folders and use tags for cross-referencing
- **Rich Media**: Insert images, diagrams, and file attachments
- **Advanced Formatting**: Support for math equations and diagrams
- **Note Linking**: Create connections between your notes to build a personal knowledge network

Let's explore some of these features in detail by checking out the other notes in this Getting Started folder. Click on any note in the sidebar to view it.

## Basic Navigation

- Use the sidebar on the left to navigate between folders and notes
- Create new notes with the + button in the sidebar
- Toggle between edit and preview modes using the buttons in the top toolbar
- Search for notes using the search bar at the top

Happy note-taking!
`,
  tags: ['tutorial', 'basics'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: true,
};

const MARKDOWN_NOTE: Note = {
  id: 'markdown-note',
  title: 'Markdown Formatting Guide',
  content: `# Markdown Formatting Guide

Notable uses [GitHub-flavored Markdown](https://guides.github.com/features/mastering-markdown/) for note formatting. Here's a quick reference:

## Basic Syntax

### Headings
\`\`\`
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
\`\`\`

### Emphasis
\`\`\`
*Italic text* or _Italic text_
**Bold text** or __Bold text__
~~Strikethrough~~
\`\`\`

*Italic text* | **Bold text** | ~~Strikethrough~~

### Lists

Unordered list:
\`\`\`
- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
\`\`\`

- Item 1
- Item 2
  - Nested item 1
  - Nested item 2

Ordered list:
\`\`\`
1. First item
2. Second item
3. Third item
\`\`\`

1. First item
2. Second item
3. Third item

### Links and Images

\`\`\`
[Link text](https://example.com)
![Alt text](image-url)
\`\`\`

### Code

Inline code: \`const example = "hello world"\`

Code blocks:
\`\`\`javascript
function sayHello() {
  console.log("Hello, world!");
}
\`\`\`

### Blockquotes

\`\`\`
> This is a blockquote
> It can span multiple lines
\`\`\`

> This is a blockquote
> It can span multiple lines

### Tables

\`\`\`
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
\`\`\`

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Task Lists

\`\`\`
- [x] Completed task
- [ ] Incomplete task
\`\`\`

- [x] Completed task
- [ ] Incomplete task

## Try it yourself!

Edit this note (click the pen icon) to experiment with markdown formatting.
`,
  tags: ['tutorial', 'markdown'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: false,
};

const MATH_DIAGRAMS_NOTE: Note = {
  id: 'math-diagrams-note',
  title: 'Math & Diagrams',
  content: `# Math Equations & Diagrams

Notable supports both mathematical equations and diagrams to help you create rich, visual notes.

## Mathematical Equations

Notable supports [KaTeX](https://katex.org/) for mathematical equations and [AsciiMath](http://asciimath.org) for simpler math notation.

### KaTeX Examples

Inline equation: $E = mc^2$

Block equation:

$$
\\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}
$$

Matrix:

$$
\\begin{pmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{pmatrix}
$$

Aligned equations:

$$
\\begin{align}
a &= b + c \\\\
&= d + e + f + g \\\\
&= h + i
\\end{align}
$$

### AsciiMath Examples

You can use AsciiMath for simpler notation:

$sum_(i=1)^n i^3=((n(n+1))/2)^2$

## Diagrams with Mermaid

Notable supports [Mermaid](https://mermaid-js.github.io/mermaid/) for creating diagrams directly in your notes. Here are some examples:

### Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am good thanks!
\`\`\`

### Gantt Chart

\`\`\`mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2023-07-01, 30d
    Another task     :after a1, 20d
    section Another
    Task in sec      :2023-07-12, 12d
    another task     :24d
\`\`\`

### Class Diagram

\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
\`\`\`

## Try creating your own!

Edit this note to experiment with KaTeX and Mermaid syntax.
`,
  tags: ['tutorial', 'advanced'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: false,
};

const ORGANIZING_NOTE: Note = {
  id: 'organizing-note',
  title: 'Organizing Your Notes',
  content: `# Organizing Your Notes

Notable provides several ways to organize your notes efficiently:

## Folders

Folders are the primary way to organize notes by topic or project:

- **Create folders**: Click the "+" button next to "Folders" in the sidebar
- **Move notes**: Drag and drop notes between folders
- **Rename folders**: Right-click on a folder and select "Rename"
- **Delete folders**: Right-click on a folder and select "Delete" (this will delete all notes in the folder)

## Tags

Tags provide a flexible way to categorize notes across different folders:

- **Add tags**: Click the tag icon in the note editor or type @ in the editor to select from existing tags
- **Filter by tag**: Click on a tag in the sidebar to show all notes with that tag
- **Manage tags**: Use the tag manager to create, edit, and delete tags

## Favorites

Mark important notes as favorites for quick access:

- **Add to favorites**: Click the star icon in the note header
- **View favorites**: Click "Favorites" in the sidebar to see all favorited notes

## Search

Use the search function to find notes quickly:

- **Basic search**: Type in the search bar to find notes containing the search term
- **Advanced search**: Use filters to search by tag, folder, or date

## Tips for Organization

1. **Create a hierarchy**: Use folders for broad categories and tags for specific themes
2. **Use consistent naming**: Establish a naming convention for folders and tags
3. **Regular review**: Periodically review and reorganize your notes
4. **Archive old notes**: Move old or less relevant notes to an "Archive" folder
5. **Use templates**: Create template notes for recurring types of information

## Next Steps

Try organizing the notes in this Getting Started folder by:
1. Adding tags
2. Marking as favorites
3. Creating subfolders

This will help you understand how to keep your notes organized as your collection grows.
`,
  tags: ['tutorial', 'organization'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: false,
};

const ATTACHMENTS_NOTE: Note = {
  id: 'attachments-note',
  title: 'Working with Attachments',
  content: `# Working with Attachments

Notable allows you to add various types of attachments to your notes, making them more informative and useful.

## Adding Attachments

There are several ways to add attachments to your notes:

### 1. Using the Attachment Button

1. Click the paperclip icon in the toolbar
2. Select a file from your computer
3. The file will be uploaded and linked in your note

### 2. Drag and Drop

Simply drag files from your computer and drop them into the note editor.

### 3. Copy and Paste

Copy an image to your clipboard (e.g., a screenshot) and paste it directly into your note.

### 4. Using the Attachments Manager

1. Click the paperclip icon in the toolbar
2. View all attachments in the current note
3. Insert any existing attachment at your cursor position

## Supported File Types

Notable supports various file types as attachments:

- **Images**: jpg, jpeg, png, gif, webp
- **Documents**: pdf, doc, docx, txt
- **Other**: Any file type can be attached, but only certain types can be previewed

## Referencing Attachments

Once you've added an attachment, you can reference it in your note using markdown syntax:

\`\`\`markdown
![Image description](@attachment/attachment-id)
\`\`\`

For non-image files:

\`\`\`markdown
[File name](@attachment/attachment-id)
\`\`\`

## Managing Attachments

The Attachments Manager allows you to:

- View all attachments in the current note
- Insert attachments at your cursor position
- Delete attachments you no longer need

## Tips for Working with Attachments

1. **Use descriptive names**: When adding attachments, use clear filenames
2. **Optimize images**: Large images can slow down your note rendering
3. **Organize attachments**: Use a consistent approach to attaching files
4. **Back up regularly**: While attachments are stored with your notes, always keep important files backed up elsewhere

## Try it out!

Add an image or document to this note to see how attachments work in Notable.
`,
  tags: ['tutorial', 'attachments'],
  folderId: 'demo-folder',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorite: false,
};

const INITIAL_TAGS: Tag[] = [
  { id: uuidv4(), name: 'tutorial', displayName: 'Tutorial', color: '#4CAF50' },
  { id: uuidv4(), name: 'markdown', displayName: 'Markdown', color: '#2196F3' },
  { id: uuidv4(), name: 'important', displayName: 'Important', color: '#F44336' },
  { id: uuidv4(), name: 'ideas', displayName: 'Ideas', color: '#9C27B0' },
  { id: uuidv4(), name: 'basics', displayName: 'Basics', color: '#FF9800' },
  { id: uuidv4(), name: 'advanced', displayName: 'Advanced', color: '#607D8B' },
  { id: uuidv4(), name: 'organization', displayName: 'Organization', color: '#795548' },
  { id: uuidv4(), name: 'attachments', displayName: 'Attachments', color: '#009688' },
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
            notes: [WELCOME_NOTE, MARKDOWN_NOTE, MATH_DIAGRAMS_NOTE, ORGANIZING_NOTE, ATTACHMENTS_NOTE],
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

  const moveNote = (noteId: string, targetFolderId: string) => {
    const noteToMove = notes.find((note) => note.id === noteId);
    if (!noteToMove) return;

    const sourceFolderId = noteToMove.folderId;
    const sourceFolder = folders.find((folder) => folder.id === sourceFolderId);
    const targetFolder = folders.find((folder) => folder.id === targetFolderId);
    
    if (!sourceFolder || !targetFolder || sourceFolderId === targetFolderId) return;

    const updatedNote = {
      ...noteToMove,
      folderId: targetFolderId,
      updatedAt: new Date()
    };

    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === noteId) {
          return updatedNote;
        }
        return note;
      });
    });

    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === sourceFolderId) {
          return {
            ...folder,
            notes: folder.notes.filter((note) => note.id !== noteId),
            updatedAt: new Date(),
          };
        }
        if (folder.id === targetFolderId) {
          return {
            ...folder,
            notes: [...folder.notes, updatedNote],
            updatedAt: new Date(),
          };
        }
        return folder;
      });
    });

    if (currentNote?.id === noteId) {
      setCurrentNoteState(updatedNote);
      setCurrentFolderState(targetFolder);
    }

    toast({
      title: "Note Moved",
      description: `"${noteToMove.title}" has been moved to "${targetFolder.name}" folder.`,
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
    const displayName = name.trim();
    const newTagName = displayName.toLowerCase().replace(/\s+/g, '-');
    
    const newTag: Tag = {
      id: uuidv4(),
      name: newTagName,
      displayName: displayName,
      color,
    };

    setTags([...tags, newTag]);
    toast({
      title: 'Tag Created',
      description: `Tag "${displayName}" has been created.`,
    });
  };

  const updateTag = (tagId: string, name: string, color: string) => {
    const tagToUpdate = tags.find((tag) => tag.id === tagId);
    if (!tagToUpdate) return;

    const oldTagName = tagToUpdate.name;
    const displayName = name.trim();
    const newTagName = displayName.toLowerCase().replace(/\s+/g, '-');

    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === tagId) {
          return {
            ...tag,
            name: newTagName,
            displayName: displayName,
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
      description: `Tag "${oldTagName}" has been updated to "${displayName}".`,
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
    const displayName = tagName.trim();
    const formattedTagName = displayName.toLowerCase().replace(/\s+/g, '-');

    if (!tags.some((tag) => tag.name === formattedTagName)) {
      const colors = ['#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#FF9800', '#795548', '#607D8B'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addTag(displayName, randomColor);
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

  const addAttachment = async (noteId: string, file: File): Promise<Attachment> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const newAttachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          url: dataUrl,
          noteId: noteId,
          createdAt: new Date(),
        };
        
        setNotes((prevNotes) => {
          return prevNotes.map((note) => {
            if (note.id === noteId) {
              const updatedNote = {
                ...note,
                attachments: [...(note.attachments || []), newAttachment],
                updatedAt: new Date(),
              };
              if (currentNote?.id === noteId) {
                setCurrentNoteState(updatedNote);
              }
              return updatedNote;
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
                  attachments: [...(note.attachments || []), newAttachment],
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
          title: 'Attachment Added',
          description: `${file.name} has been added to the note.`,
        });
        
        resolve(newAttachment);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const deleteAttachment = (noteId: string, attachmentId: string) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === noteId && note.attachments) {
          const updatedNote = {
            ...note,
            attachments: note.attachments.filter((att) => att.id !== attachmentId),
            updatedAt: new Date(),
          };
          if (currentNote?.id === noteId) {
            setCurrentNoteState(updatedNote);
          }
          return updatedNote;
        }
        return note;
      });
    });
    
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        const updatedNotes = folder.notes.map((note) => {
          if (note.id === noteId && note.attachments) {
            return {
              ...note,
              attachments: note.attachments.filter((att) => att.id !== attachmentId),
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
      title: 'Attachment Deleted',
      description: `The attachment has been removed from the note.`,
    });
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
    moveNote,
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
    addAttachment,
    deleteAttachment,
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
