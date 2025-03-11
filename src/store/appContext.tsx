
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder, Tag, Attachment, ViewMode } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface AppContextType {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
  currentFolder: Folder | null;
  currentNote: Note | null;
  searchQuery: string;
  isEditing: boolean;
  viewMode: ViewMode;
  showAIPanel: boolean;
  createFolder: (name: string, path: string) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  createNote: (folderId: string, title: string, content?: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  setCurrentNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  updateNoteContent: (
    contentOrUpdater: string | ((prevContent: string) => string)
  ) => void;
  setIsEditing: (isEditing: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  createTag: (name: string, color: string) => void;
  updateTag: (id: string, name: string, color: string) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagName: string) => void;
  removeTagFromNote: (noteId: string, tagName: string) => void;
  setShowAIPanel: (show: boolean) => void;
  toggleFavorite: (noteId: string) => void;
  addAttachment: (noteId: string, file: File) => Promise<Attachment>;
  removeAttachment: (noteId: string, attachmentId: string) => void;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
  addTag: (name: string, color: string) => void;
  removeTag: (id: string) => void;
  moveNote: (noteId: string, targetFolderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useLocalStorage<Folder[]>('folders', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [tags, setTags] = useLocalStorage<Tag[]>('tags', []);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folders.length > 0 ? folders[0].id : null
  );
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Derived states
  const currentFolder = currentFolderId 
    ? folders.find(folder => folder.id === currentFolderId) || null
    : null;
  
  const currentNote = currentNoteId
    ? notes.find(note => note.id === currentNoteId) || null
    : null;

  useEffect(() => {
    if (folders.length > 0 && !currentFolderId) {
      setCurrentFolderId(folders[0].id);
    }
  }, [folders, currentFolderId]);

  useEffect(() => {
    if (notes.length > 0 && !currentNoteId) {
      setCurrentNoteId(notes[0].id);
    }
  }, [notes, currentNoteId]);

  const createFolder = (name: string, path: string) => {
    const newFolder: Folder = { 
      id: uuidv4(), 
      name, 
      path, 
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    setCurrentFolderId(newFolder.id);
  };

  const updateFolder = (folder: Folder) => {
    setFolders((prevFolders) =>
      prevFolders.map((f) => (f.id === folder.id ? { ...f, ...folder, updatedAt: new Date() } : f))
    );
  };

  const deleteFolder = (id: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
    setNotes((prevNotes) => prevNotes.filter((note) => note.folderId !== id));
    if (currentFolderId === id) {
      setCurrentFolderId(folders.length > 1 ? folders.find(f => f.id !== id)?.id || null : null);
    }
  };

  const createNote = (folderId: string, title: string, content: string = '') => {
    const newNote: Note = {
      id: uuidv4(),
      folderId,
      title,
      content,
      favorite: false,
      tags: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setCurrentNoteId(newNote.id);
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === note.id ? { ...n, ...note, updatedAt: new Date() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (currentNoteId === id) {
      setCurrentNoteId(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null);
    }
  };

  const updateNoteContent = useCallback(
    (
      contentOrUpdater: string | ((prevContent: string) => string)
    ) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === currentNoteId) {
            const newContent = typeof contentOrUpdater === 'function'
              ? contentOrUpdater(note.content)
              : contentOrUpdater;
            return { ...note, content: newContent, updatedAt: new Date() };
          }
          return note;
        })
      );
    },
    [currentNoteId, setNotes]
  );

  const createTag = (name: string, color: string) => {
    const newTag: Tag = { 
      id: uuidv4(), 
      name, 
      color, 
      displayName: name 
    };
    setTags((prevTags) => [...prevTags, newTag]);
  };

  // Alias for compatibility
  const addTag = createTag;

  const updateTag = (id: string, name: string, color: string) => {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, name, color, displayName: name } : tag))
    );
  };

  const deleteTag = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    // Also remove the tag from all notes
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        tags: note.tags.filter((tagName) => {
          const tag = tags.find((t) => t.name === tagName);
          return tag?.id !== id;
        }),
      }))
    );
  };

  // Alias for compatibility
  const removeTag = deleteTag;

  const addTagToNote = (noteId: string, tagName: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId && !note.tags.includes(tagName)
          ? { ...note, tags: [...note.tags, tagName], updatedAt: new Date() }
          : note
      )
    );
  };

  const removeTagFromNote = (noteId: string, tagName: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, tags: note.tags.filter((tag) => tag !== tagName), updatedAt: new Date() }
          : note
      )
    );
  };

  const toggleFavorite = (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, favorite: !note.favorite, updatedAt: new Date() } : note
      )
    );
  };

  const addAttachment = async (noteId: string, file: File): Promise<Attachment> => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const newAttachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        url: dataUrl,
        noteId: noteId,
        createdAt: new Date(),
        size: file.size
      };

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { 
                ...note, 
                attachments: [...(note.attachments || []), newAttachment],
                updatedAt: new Date()
              }
            : note
        )
      );
      
      return newAttachment;
    } catch (error) {
      console.error("Error adding attachment:", error);
      throw error;
    }
  };

  const removeAttachment = (noteId: string, attachmentId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              attachments: (note.attachments || []).filter((att) => att.id !== attachmentId),
              updatedAt: new Date()
            }
          : note
      )
    );
  };

  // Alias for compatibility
  const deleteAttachment = removeAttachment;

  const moveNote = (noteId: string, targetFolderId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, folderId: targetFolderId, updatedAt: new Date() }
          : note
      )
    );
  };

  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const setCurrentNote = (noteId: string | null) => {
    setCurrentNoteId(noteId);
  };

  const contextValue: AppContextType = {
    folders,
    notes,
    tags,
    currentFolder,
    currentNote,
    searchQuery,
    isEditing,
    viewMode,
    showAIPanel,
    createFolder,
    updateFolder,
    deleteFolder,
    createNote,
    updateNote,
    deleteNote,
    setCurrentFolder,
    setCurrentNote,
    setSearchQuery,
    updateNoteContent,
    setIsEditing,
    setViewMode,
    createTag,
    updateTag,
    deleteTag,
    addTagToNote,
    removeTagFromNote,
    setShowAIPanel,
    toggleFavorite,
    addAttachment,
    removeAttachment,
    deleteAttachment,
    addTag,
    removeTag,
    moveNote
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
