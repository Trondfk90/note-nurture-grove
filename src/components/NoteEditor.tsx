
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/store/appContext';
import { Note } from '@/types';
import ManageTags from './ManageTags';
import NoteHeader from './editor/NoteHeader';
import SearchBar from './editor/SearchBar';
import NoteTags from './editor/NoteTags';
import DeleteNoteDialog from './editor/DeleteNoteDialog';
import AttachmentsDialog from './editor/AttachmentsDialog';
import EditorContent from './editor/EditorContent';
import NewNoteForm from './editor/NewNoteForm';
import EmptyState from './editor/EmptyState';
import { useNotePaste } from './editor/useNotePaste';
import { useFileUpload } from './editor/useFileUpload';
import { useNoteSearch } from './editor/useNoteSearch';

const NoteEditor: React.FC = () => {
  const {
    currentNote,
    updateNote,
    deleteNote,
    isEditing,
    toggleFavorite,
    createNote,
    currentFolder,
  } = useAppContext();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const { textareaRef, handlePaste } = useNotePaste(
    currentNote, 
    isEditing, 
    editedContent, 
    setEditedContent, 
    setUnsavedChanges
  );
  
  const { fileInputRef, handleFileUpload, insertAttachmentLink } = useFileUpload(
    currentNote, 
    editedContent, 
    setEditedContent, 
    setUnsavedChanges
  );
  
  const {
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    currentSearchIndex,
    handleSearch,
    nextSearchResult,
    prevSearchResult
  } = useNoteSearch(editedContent, textareaRef);

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
      const defaultContent = `# ${newNoteTitle}\n\nStart writing your note here...`;
      createNote(currentFolder.id, newNoteTitle, defaultContent);
      setIsCreatingNewNote(false);
      setNewNoteTitle('');
    }
  };

  if (isCreatingNewNote) {
    return (
      <NewNoteForm
        newNoteTitle={newNoteTitle}
        setNewNoteTitle={setNewNoteTitle}
        handleCreateNewNote={handleCreateNewNote}
        setIsCreatingNewNote={setIsCreatingNewNote}
      />
    );
  }

  if (!currentNote && !isCreatingNewNote) {
    return (
      <EmptyState
        currentFolder={currentFolder}
        setIsCreatingNewNote={setIsCreatingNewNote}
      />
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
        currentSearchIndex={currentSearchIndex}
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
