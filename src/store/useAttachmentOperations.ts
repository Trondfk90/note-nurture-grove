
import { v4 as uuidv4 } from 'uuid';
import { Note, Attachment } from '@/types';

export const useAttachmentOperations = (
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
) => {
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

  return {
    addAttachment,
    removeAttachment,
    deleteAttachment
  };
};
