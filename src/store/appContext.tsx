import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder, Tag, Attachment } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface AppContextType {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
  currentFolder: Folder | null;
  currentNote: string | null;
  searchQuery: string;
  isEditing: boolean;
  viewMode: 'edit' | 'preview' | 'split';
  showAIPanel: boolean;
  createFolder: (name: string, path: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  createNote: (folderId: string, title: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  setCurrentNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  updateNoteContent: (
    contentOrUpdater:
      | string
      | ((prevContent: string) => string)
  ) => void;
  setIsEditing: (isEditing: boolean) => void;
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void;
  createTag: (name: string, color: string, displayName?: string) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagName: string) => void;
  removeTagFromNote: (noteId: string, tagName: string) => void;
  setShowAIPanel: (show: boolean) => void;
  toggleFavorite: (noteId: string) => void;
  addAttachment: (noteId: string, file: File) => Promise<void>;
  removeAttachment: (noteId: string, attachmentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useLocalStorage<Folder[]>('folders', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [tags, setTags] = useLocalStorage<Tag[]>('tags', []);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(
    folders.length > 0 ? folders[0] : null
  );
  const [currentNote, setCurrentNote] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    if (folders.length > 0) {
      setCurrentFolder(folders[0]);
    }
  }, [folders]);

  useEffect(() => {
    if (notes.length > 0) {
      setCurrentNote(notes[0].id);
    }
  }, [notes]);

  const createFolder = (name: string, path: string) => {
    const newFolder: Folder = { id: uuidv4(), name, path };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    setCurrentFolder(newFolder);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder))
    );
  };

  const deleteFolder = (id: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
    setNotes((prevNotes) => prevNotes.filter((note) => note.folderId !== id));
    if (currentFolder?.id === id) {
      setCurrentFolder(folders.length > 1 ? folders[0] : null);
    }
  };

  const createNote = (folderId: string, title: string) => {
    const newNote: Note = {
      id: uuidv4(),
      folderId,
      title,
      content: '',
      favorite: false,
      tags: [],
      attachments: [],
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setCurrentNote(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (currentNote === id) {
      setCurrentNote(notes.length > 1 ? notes[0].id : null);
    }
  };

  const updateNoteContent = useCallback(
    (
      contentOrUpdater:
        | string
        | ((prevContent: string) => string)
    ) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === currentNote) {
            const newContent = typeof contentOrUpdater === 'function'
              ? contentOrUpdater(note.content)
              : contentOrUpdater;
            return { ...note, content: newContent };
          }
          return note;
        })
      );
    },
    [currentNote, setNotes]
  );

  const createTag = (name: string, color: string, displayName?: string) => {
    const newTag: Tag = { id: uuidv4(), name, color, displayName };
    setTags((prevTags) => [...prevTags, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag))
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

  const addTagToNote = (noteId: string, tagName: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId && !note.tags.includes(tagName)
          ? { ...note, tags: [...note.tags, tagName] }
          : note
      )
    );
  };

  const removeTagFromNote = (noteId: string, tagName: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, tags: note.tags.filter((tag) => tag !== tagName) }
          : note
      )
    );
  };

  const toggleFavorite = (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, favorite: !note.favorite } : note
      )
    );
  };

  const addAttachment = async (noteId: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      const dataUrl = reader.result as string;

      const newAttachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: dataUrl,
      };

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, attachments: [...note.attachments, newAttachment] }
            : note
        )
      );
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
            attachments: note.attachments.filter((att) => att.id !== attachmentId),
          }
          : note
      )
    );
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
