
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Attachment } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const useNoteOperations = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  
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
    (contentOrUpdater: string | ((prevContent: string) => string)) => {
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

  const toggleFavorite = (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, favorite: !note.favorite, updatedAt: new Date() } : note
      )
    );
  };

  const moveNote = (noteId: string, targetFolderId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, folderId: targetFolderId, updatedAt: new Date() }
          : note
      )
    );
  };

  return {
    notes,
    setNotes, // Expose setNotes so it can be passed to other hooks
    currentNoteId,
    setCurrentNoteId,
    createNote,
    updateNote,
    deleteNote,
    updateNoteContent,
    toggleFavorite,
    moveNote
  };
};
