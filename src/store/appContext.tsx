
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';
import { Note, Folder, ViewMode } from '@/types';
import { AppContextType } from './appContextTypes';
import { useFolderOperations } from './useFolderOperations';
import { useNoteOperations } from './useNoteOperations';
import { useTagOperations } from './useTagOperations';
import { useAttachmentOperations } from './useAttachmentOperations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    folders,
    currentFolderId,
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder
  } = useFolderOperations();
  
  const {
    notes,
    setNotes,
    currentNoteId,
    setCurrentNoteId,
    createNote,
    updateNote,
    deleteNote,
    updateNoteContent,
    toggleFavorite,
    moveNote
  } = useNoteOperations();
  
  const {
    tags,
    createTag,
    updateTag,
    deleteTag,
    addTag,
    removeTag,
    addTagToNote: baseAddTagToNote,
    removeTagFromNote: baseRemoveTagFromNote,
    removeTagFromAllNotes
  } = useTagOperations();
  
  // Pass notes and setNotes to useAttachmentOperations
  const {
    addAttachment,
    removeAttachment,
    deleteAttachment
  } = useAttachmentOperations(notes, setNotes);

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Adapted functions that use notes and setNotes directly
  const adaptedAddTagToNote = (noteId: string, tagName: string) => {
    baseAddTagToNote(noteId, tagName, notes, setNotes);
  };

  const adaptedRemoveTagFromNote = (noteId: string, tagName: string) => {
    baseRemoveTagFromNote(noteId, tagName, notes, setNotes);
  };

  // Derived states
  const currentFolder = currentFolderId 
    ? folders.find(folder => folder.id === currentFolderId) || null
    : null;
  
  const currentNote = currentNoteId
    ? notes.find(note => note.id === currentNoteId) || null
    : null;

  // Setup initial folder if needed
  useEffect(() => {
    if (folders.length > 0 && !currentFolderId) {
      setCurrentFolder(folders[0].id);
    }
  }, [folders, currentFolderId, setCurrentFolder]);

  // Setup initial note if needed
  useEffect(() => {
    if (notes.length > 0 && !currentNoteId) {
      setCurrentNoteId(notes[0].id);
    }
  }, [notes, currentNoteId, setCurrentNoteId]);

  // When a tag is deleted, remove it from all notes
  useEffect(() => {
    const handleTagDelete = (tagId: string) => {
      removeTagFromAllNotes(tagId, notes, setNotes, tags);
    };

    const originalDeleteTag = deleteTag;
    // Override the deleteTag function to also remove the tag from all notes
    (deleteTag as any) = (id: string) => {
      handleTagDelete(id);
      originalDeleteTag(id);
    };

    return () => {
      // Restore the original function when the component unmounts
      (deleteTag as any) = originalDeleteTag;
    };
  }, [deleteTag, notes, setNotes, tags, removeTagFromAllNotes]);

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
    addTagToNote: adaptedAddTagToNote,
    removeTagFromNote: adaptedRemoveTagFromNote,
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
