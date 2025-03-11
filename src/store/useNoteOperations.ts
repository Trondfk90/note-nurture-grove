import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, Attachment } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fileSystemService } from '@/services/fileSystemService';
import path from 'path-browserify';
import { toast } from '@/components/ui/use-toast';

export const useNoteOperations = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const saveTimeoutRef = useRef<number | null>(null);
  
  const createNote = async (folderId: string, title: string, content: string = '') => {
    const folder = JSON.parse(localStorage.getItem('folders') || '[]')
      .find((f: any) => f.id === folderId);
    
    if (!folder) {
      toast({
        title: "Error creating note",
        description: "Folder not found",
        variant: "destructive"
      });
      return;
    }

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

    const saveResult = await fileSystemService.saveNoteToFile(folder.path, newNote);
    
    if (saveResult) {
      toast({
        title: "Note created",
        description: `Note "${title}" saved to ${folder.path}`
      });
    }
  };

  const updateNote = async (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === note.id ? { ...n, ...note, updatedAt: new Date() } : n))
    );
    
    const folders = JSON.parse(localStorage.getItem('folders') || '[]');
    const folder = folders.find((f: any) => f.id === note.folderId);
    
    if (folder) {
      await fileSystemService.saveNoteToFile(folder.path, note);
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (currentNoteId === id) {
      setCurrentNoteId(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null);
    }
  };

  const updateNoteContent = useCallback(
    async (contentOrUpdater: string | ((prevContent: string) => string)) => {
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.map((note) => {
          if (note.id === currentNoteId) {
            const newContent = typeof contentOrUpdater === 'function'
              ? contentOrUpdater(note.content)
              : contentOrUpdater;
            return { ...note, content: newContent, updatedAt: new Date() };
          }
          return note;
        });

        const currentNote = updatedNotes.find(note => note.id === currentNoteId);
        if (currentNote) {
          const folders = JSON.parse(localStorage.getItem('folders') || '[]');
          const folder = folders.find((f: any) => f.id === currentNote.folderId);
          
          if (folder) {
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }
            
            saveTimeoutRef.current = window.setTimeout(() => {
              fileSystemService.saveNoteToFile(folder.path, currentNote);
            }, 1000);
          }
        }
        
        return updatedNotes;
      });
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
    setNotes,
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
