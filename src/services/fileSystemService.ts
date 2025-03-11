
import { Note } from '@/types';
import { join } from 'path';

// Check if we're running in Electron
const isElectron = () => {
  // @ts-ignore
  return window.electronAPI !== undefined;
};

export const fileSystemService = {
  /**
   * Open native folder selection dialog
   */
  selectFolder: async (): Promise<string | null> => {
    if (!isElectron()) {
      console.warn('File system operations are only available in Electron');
      return null;
    }

    try {
      // @ts-ignore
      return await window.electronAPI.selectFolder();
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  },

  /**
   * Save note content to a file
   */
  saveNoteToFile: async (folderPath: string, note: Note): Promise<boolean> => {
    if (!isElectron()) {
      console.warn('File system operations are only available in Electron');
      return false;
    }

    try {
      const safeFileName = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = join(folderPath, `${safeFileName}.md`);
      
      // @ts-ignore
      const result = await window.electronAPI.saveNote(filePath, note.content);
      return result.success;
    } catch (error) {
      console.error('Error saving note to file:', error);
      return false;
    }
  },

  /**
   * Read note content from a file
   */
  readNoteFromFile: async (filePath: string): Promise<string | null> => {
    if (!isElectron()) {
      console.warn('File system operations are only available in Electron');
      return null;
    }

    try {
      // @ts-ignore
      const result = await window.electronAPI.readNote(filePath);
      return result.success ? result.content : null;
    } catch (error) {
      console.error('Error reading note from file:', error);
      return null;
    }
  }
};
