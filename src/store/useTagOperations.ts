
import { v4 as uuidv4 } from 'uuid';
import { Tag, Note } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const useTagOperations = () => {
  const [tags, setTags] = useLocalStorage<Tag[]>('tags', []);

  const createTag = (name: string, color: string = '#4CAF50') => {
    // Check if tag with this name already exists
    const existingTag = tags.find(tag => tag.name === name);
    
    if (existingTag) {
      // Return existing tag to avoid duplicates
      return existingTag;
    }
    
    const newTag: Tag = { 
      id: uuidv4(), 
      name, 
      color, 
      displayName: name 
    };
    
    setTags((prevTags) => [...prevTags, newTag]);
    return newTag;
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
  };

  // Alias for compatibility
  const removeTag = deleteTag;

  const addTagToNote = (
    noteId: string, 
    tagName: string, 
    notesArray: Note[], 
    setNotesFunction: React.Dispatch<React.SetStateAction<Note[]>>
  ) => {
    // First ensure tag exists in the tags collection
    createTag(tagName);
    
    setNotesFunction((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId && !note.tags.includes(tagName)
          ? { ...note, tags: [...note.tags, tagName], updatedAt: new Date() }
          : note
      )
    );
  };

  const removeTagFromNote = (
    noteId: string, 
    tagName: string, 
    notesArray: Note[], 
    setNotesFunction: React.Dispatch<React.SetStateAction<Note[]>>
  ) => {
    setNotesFunction((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, tags: note.tags.filter((tag) => tag !== tagName), updatedAt: new Date() }
          : note
      )
    );
  };

  const removeTagFromAllNotes = (
    tagId: string, 
    notesArray: Note[], 
    setNotesFunction: React.Dispatch<React.SetStateAction<Note[]>>, 
    tagsArray: Tag[]
  ) => {
    const tagToRemove = tagsArray.find(tag => tag.id === tagId);
    if (!tagToRemove) return;
    
    setNotesFunction((prevNotes) =>
      prevNotes.map((note) => ({
        ...note,
        tags: note.tags.filter((tagName) => tagName !== tagToRemove.name),
        updatedAt: new Date()
      }))
    );
  };

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    addTag,
    removeTag,
    addTagToNote,
    removeTagFromNote,
    removeTagFromAllNotes
  };
};
