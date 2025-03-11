
import { useState, useRef } from 'react';
import { Note, Attachment } from '@/types';
import { useAppContext } from '@/store/appContext';
import { CodeEditorRef } from '@/components/CodeEditor';

export const useNotePaste = (
  currentNote: Note | null, 
  isEditing: boolean, 
  editedContent: string, 
  setEditedContent: (content: string) => void, 
  setUnsavedChanges: (unsaved: boolean) => void
) => {
  const { addAttachment } = useAppContext();
  const textareaRef = useRef<CodeEditorRef>(null);

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!currentNote || !isEditing) return;
    
    const clipboardItems = e.clipboardData.items;
    let hasHandledImage = false;
    
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.indexOf('image') === 0) {
        e.preventDefault();
        
        const blob = clipboardItems[i].getAsFile();
        if (!blob) continue;
        
        const timestamp = new Date().getTime();
        const fileName = `pasted-image-${timestamp}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        
        try {
          const attachment = await addAttachment(currentNote.id, file);
          const markdownImg = `![${attachment.name}](attachment:${attachment.id})`;
          
          if (textareaRef.current) {
            const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
            if (textarea) {
              const cursorPos = textarea.selectionStart;
              const textBefore = editedContent.substring(0, cursorPos);
              const textAfter = editedContent.substring(cursorPos);
              const newContent = textBefore + markdownImg + textAfter;
              
              setEditedContent(newContent);
              setUnsavedChanges(true);
              
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                  cursorPos + markdownImg.length,
                  cursorPos + markdownImg.length
                );
              }, 0);
            }
          }
        } catch (err) {
          console.error('Error handling pasted image:', err);
        }
        
        hasHandledImage = true;
        break;
      }
    }
    
    return !hasHandledImage;
  };

  return { textareaRef, handlePaste };
};
