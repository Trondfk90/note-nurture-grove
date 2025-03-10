
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/appContext';
import { CodeEditorRef } from './CodeEditor';
import { Note, Attachment } from '@/types';
import ManageTags from './ManageTags';
import NoteHeader from './editor/NoteHeader';
import SearchBar from './editor/SearchBar';
import NoteTags from './editor/NoteTags';
import DeleteNoteDialog from './editor/DeleteNoteDialog';
import AttachmentsDialog from './editor/AttachmentsDialog';
import EditorContent from './editor/EditorContent';

const NoteEditor: React.FC = () => {
  const {
    currentNote,
    updateNote,
    deleteNote,
    isEditing,
    addAttachment,
    toggleFavorite,
    createNote,
    currentFolder,
  } = useAppContext();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{index: number, line: number}[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const textareaRef = useRef<CodeEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title);
      setEditedContent(currentNote.content);
      setUnsavedChanges(false);
      setIsCreatingNewNote(false);
    }
  }, [currentNote]);

  const handleSave = () => {
    if (currentNote) {
      const updatedNote: Note = {
        ...currentNote,
        title: editedTitle,
        content: editedContent,
      };
      updateNote(updatedNote);
      setUnsavedChanges(false);
    }
  };

  const handleDeleteNote = () => {
    if (currentNote) {
      deleteNote(currentNote.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleFavorite = () => {
    if (currentNote) {
      toggleFavorite(currentNote.id);
    }
  };

  const handleCreateNewNote = () => {
    if (currentFolder && newNoteTitle.trim()) {
      createNote(currentFolder.id, newNoteTitle);
      setIsCreatingNewNote(false);
      setNewNoteTitle('');
    }
  };

  const handleSearch = () => {
    if (!searchQuery || !editedContent) return;
    
    const query = searchQuery.toLowerCase();
    const content = editedContent.toLowerCase();
    const lines = editedContent.split('\n');
    
    const results: {index: number, line: number}[] = [];
    let currentIndex = 0;
    
    lines.forEach((line, lineIndex) => {
      const lineLower = line.toLowerCase();
      let position = 0;
      
      while (position < lineLower.length) {
        const foundIndex = lineLower.indexOf(query, position);
        if (foundIndex === -1) break;
        
        results.push({
          index: currentIndex + foundIndex,
          line: lineIndex + 1
        });
        
        position = foundIndex + query.length;
      }
      
      currentIndex += line.length + 1;
    });
    
    setSearchResults(results);
    setCurrentSearchIndex(0);
    
    if (results.length > 0) {
      navigateToSearchResult(results[0]);
    }
  };

  const navigateToSearchResult = (result: {index: number, line: number}) => {
    if (!textareaRef.current) return;
    textareaRef.current.scrollToSearchResult(result.index, searchQuery.length);
  };
  
  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    navigateToSearchResult(searchResults[nextIndex]);
  };
  
  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    navigateToSearchResult(searchResults[prevIndex]);
  };

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery]);

  const handlePaste = (e: React.ClipboardEvent) => {
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
        
        addAttachment(currentNote.id, file).then((attachment) => {
          const markdownImg = `![${attachment.name}](@attachment/${attachment.id})`;
          
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
        });
        
        hasHandledImage = true;
        break;
      }
    }
    
    return !hasHandledImage;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentNote || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    addAttachment(currentNote.id, file).then((attachment) => {
      let markdownRef;
      
      if (file.type.startsWith('image/')) {
        markdownRef = `![${attachment.name}](@attachment/${attachment.id})`;
      } else {
        markdownRef = `[${attachment.name}](@attachment/${attachment.id})`;
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
    });
    
    e.target.value = '';
  };
  
  const insertAttachmentLink = (attachment: Attachment) => {
    if (!currentNote || !isEditing) return;
    
    let markdownRef;
    if (attachment.type.startsWith('image/')) {
      markdownRef = `![${attachment.name}](@attachment/${attachment.id})`;
    } else {
      markdownRef = `[${attachment.name}](@attachment/${attachment.id})`;
    }
    
    const textarea = document.querySelector('.editor-container textarea') as HTMLTextAreaElement;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = editedContent.substring(0, cursorPos);
      const textAfter = editedContent.substring(cursorPos);
      const newContent = textBefore + markdownRef + textAfter;
      
      setEditedContent(newContent);
      setUnsavedChanges(true);
      setAttachmentsDialogOpen(false);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          cursorPos + markdownRef.length,
          cursorPos + markdownRef.length
        );
      }, 0);
    }
  };

  if (isCreatingNewNote) {
    return (
      <div className="flex flex-col h-full p-4 bg-secondary/30">
        <div className="flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-medium mb-4">Create a New Note</h3>
          <div className="w-full max-w-md">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note title"
              className="w-full p-2 rounded border mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreatingNewNote(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewNote}
                className="px-4 py-2 rounded bg-primary text-primary-foreground"
                disabled={!newNoteTitle.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentNote && !isCreatingNewNote) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-secondary/30">
        <div className="text-center">
          <h3 className="text-lg font-medium">No note selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select a note from the sidebar or create a new one.
          </p>
          {currentFolder && (
            <button
              onClick={() => setIsCreatingNewNote(true)}
              className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
            >
              Create New Note
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <NoteHeader
        note={currentNote}
        editedTitle={editedTitle}
        setEditedTitle={setEditedTitle}
        unsavedChanges={unsavedChanges}
        handleSave={handleSave}
        handleToggleFavorite={handleToggleFavorite}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setShowSearch={setShowSearch}
        showSearch={showSearch}
        setAttachmentsDialogOpen={setAttachmentsDialogOpen}
        setManageTagsOpen={setManageTagsOpen}
        fileInputRef={fileInputRef}
        setUnsavedChanges={setUnsavedChanges}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {showSearch && (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          prevSearchResult={prevSearchResult}
          nextSearchResult={nextSearchResult}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
          setShowSearch={setShowSearch}
          setSearchResults={setSearchResults}
        />
      )}

      <NoteTags note={currentNote} />

      <EditorContent
        note={currentNote}
        editedContent={editedContent}
        setEditedContent={setEditedContent}
        setUnsavedChanges={setUnsavedChanges}
        handlePaste={handlePaste}
        textareaRef={textareaRef}
        searchQuery={searchQuery}
        searchResults={searchResults}
      />

      <DeleteNoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        note={currentNote}
        onDelete={handleDeleteNote}
      />

      <AttachmentsDialog
        open={attachmentsDialogOpen}
        onOpenChange={setAttachmentsDialogOpen}
        note={currentNote}
        fileInputRef={fileInputRef}
        onInsertAttachment={insertAttachmentLink}
      />

      <ManageTags open={manageTagsOpen} onOpenChange={setManageTagsOpen} />
    </div>
  );
};

export default NoteEditor;
