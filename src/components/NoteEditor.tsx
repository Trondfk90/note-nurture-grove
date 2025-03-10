
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/appContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import CodeEditor, { CodeEditorRef } from './CodeEditor';
import MarkdownPreview from './MarkdownPreview';
import { Attachment, Note } from '@/types';
import NoteHeader from './notes/NoteHeader';
import SearchBar from './notes/SearchBar';
import NoteTags from './notes/NoteTags';
import AttachmentsDialog from './notes/AttachmentsDialog';
import DeleteNoteDialog from './notes/DeleteNoteDialog';
import ManageTags from './ManageTags';

const NoteEditor: React.FC = () => {
  const {
    currentNote,
    updateNote,
    deleteNote,
    viewMode,
    setViewMode,
    isEditing,
    setIsEditing,
    tags,
    addTagToNote,
    removeTagFromNote,
    toggleFavorite,
    addAttachment,
    deleteAttachment,
  } = useAppContext();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{index: number, line: number}[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const textareaRef = useRef<CodeEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title);
      setEditedContent(currentNote.content);
      setUnsavedChanges(false);
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

  const handleAddTag = () => {
    if (currentNote && newTagName.trim()) {
      addTagToNote(currentNote.id, newTagName);
      setNewTagName('');
      setTagPopoverOpen(false);
    }
  };

  const handleToggleFavorite = () => {
    if (currentNote) {
      toggleFavorite(currentNote.id);
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

  const openAttachment = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
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

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-secondary/30">
        <div className="text-center">
          <h3 className="text-lg font-medium">No note selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select a note from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <NoteHeader
        note={currentNote}
        editedTitle={editedTitle}
        setEditedTitle={(title) => {
          setEditedTitle(title);
          setUnsavedChanges(true);
        }}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setShowSearch={setShowSearch}
        showSearch={showSearch}
        unsavedChanges={unsavedChanges}
        handleSave={handleSave}
        handleToggleFavorite={handleToggleFavorite}
        setManageTagsOpen={setManageTagsOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setAttachmentsDialogOpen={setAttachmentsDialogOpen}
        fileInputRef={fileInputRef}
        viewMode={viewMode}
        setViewMode={setViewMode}
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
          setShowSearch={setShowSearch}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
        />
      )}

      <NoteTags
        noteTags={currentNote.tags}
        allTags={tags}
        isEditing={isEditing}
        tagPopoverOpen={tagPopoverOpen}
        setTagPopoverOpen={setTagPopoverOpen}
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        handleAddTag={handleAddTag}
        addTagToNote={addTagToNote}
        removeTagFromNote={removeTagFromNote}
        noteId={currentNote.id}
      />

      <div className="flex-1 overflow-hidden">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'edit' | 'preview' | 'split')}
          className="h-full flex flex-col"
        >
          <TabsList className="ml-4 mt-2">
            <TabsTrigger value="edit" disabled={!isEditing}>
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="split" disabled={!isEditing}>
              Split
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-full">
              <div onPaste={handlePaste} className="w-full h-full">
                <CodeEditor
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(value) => {
                    setEditedContent(value);
                    setUnsavedChanges(true);
                  }}
                  className="w-full h-full min-h-[calc(100vh-280px)]"
                  placeholder="Write your note in Markdown... (Paste images directly into the editor)"
                  disabled={!isEditing}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownPreview 
                  content={editedContent} 
                  attachments={currentNote.attachments}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="split" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
            <div className="grid grid-cols-2 h-full divide-x">
              <ScrollArea className="h-full">
                <div onPaste={handlePaste} className="w-full h-full">
                  <CodeEditor
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(value) => {
                      setEditedContent(value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full h-full min-h-[calc(100vh-280px)]"
                    placeholder="Write your note in Markdown... (Paste images directly into the editor)"
                    disabled={!isEditing}
                  />
                </div>
              </ScrollArea>
              <ScrollArea className="h-full">
                <div className="p-4">
                  <MarkdownPreview 
                    content={editedContent} 
                    attachments={currentNote.attachments}
                  />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteNoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        noteTitle={currentNote.title}
        onConfirm={handleDeleteNote}
      />

      <AttachmentsDialog
        open={attachmentsDialogOpen}
        onOpenChange={setAttachmentsDialogOpen}
        attachments={currentNote.attachments || []}
        fileInputRef={fileInputRef}
        insertAttachmentLink={insertAttachmentLink}
        openAttachment={openAttachment}
        deleteAttachment={deleteAttachment}
        noteId={currentNote.id}
      />

      <ManageTags open={manageTagsOpen} onOpenChange={setManageTagsOpen} />
    </div>
  );
};

export default NoteEditor;
