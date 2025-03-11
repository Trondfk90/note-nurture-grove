
import { useRef } from 'react';
import { Note, Attachment } from '@/types';
import { useAppContext } from '@/store/appContext';

export const useFileUpload = (
  currentNote: Note | null, 
  editedContent: string, 
  setEditedContent: (content: string) => void, 
  setUnsavedChanges: (unsaved: boolean) => void
) => {
  const { addAttachment } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentNote || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      const attachment = await addAttachment(currentNote.id, file);
      
      let markdownRef;
      if (file.type.startsWith('image/')) {
        markdownRef = `![${attachment.name}](attachment:${attachment.id})`;
      } else {
        markdownRef = `[${attachment.name}](attachment:${attachment.id})`;
      }
      
      const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = editedContent.substring(0, cursorPos);
        const textAfter = editedContent.substring(cursorPos);
        const newContent = textBefore + markdownRef + textAfter;
        
        setEditedContent(newContent);
        setUnsavedChanges(true);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            cursorPos + markdownRef.length,
            cursorPos + markdownRef.length
          );
        }, 0);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
    
    e.target.value = '';
  };

  const insertAttachmentLink = (attachment: Attachment) => {
    if (!currentNote) return;
    
    let markdownRef;
    if (attachment.type.startsWith('image/')) {
      markdownRef = `![${attachment.name}](attachment:${attachment.id})`;
    } else {
      markdownRef = `[${attachment.name}](attachment:${attachment.id})`;
    }
    
    const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = editedContent.substring(0, cursorPos);
      const textAfter = editedContent.substring(cursorPos);
      const newContent = textBefore + markdownRef + textAfter;
      
      setEditedContent(newContent);
      setUnsavedChanges(true);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          cursorPos + markdownRef.length,
          cursorPos + markdownRef.length
        );
      }, 0);
    }
  };

  return { fileInputRef, handleFileUpload, insertAttachmentLink };
};
