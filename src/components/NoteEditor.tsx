import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/appContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Edit2, Star, StarOff, Save, Trash2, X, Search, Plus, Tags, Paperclip, Image, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Attachment, Note } from '@/types';
import MarkdownPreview from './MarkdownPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import CodeEditor, { CodeEditorRef } from './CodeEditor';
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
      <div className="border-b border-border p-4 flex items-center">
        <div className="flex-1">
          <Input
            value={editedTitle}
            onChange={(e) => {
              setEditedTitle(e.target.value);
              setUnsavedChanges(true);
            }}
            className="text-lg font-medium border-0 p-0 h-auto focus-visible:ring-0"
            disabled={!isEditing}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="h-8 w-8"
                >
                  <Search size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search in note</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="h-8 w-8"
                  >
                    <Paperclip size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Attachment</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isEditing && currentNote.attachments && currentNote.attachments.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachmentsDialogOpen(true)}
                    className="h-8 w-8"
                  >
                    <Image size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Browse Attachments</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="h-8 w-8"
                >
                  {currentNote.favorite ? (
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {currentNote.favorite ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setManageTagsOpen(true)}
                  className="h-8 w-8"
                >
                  <Tags size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage Tags</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="h-8 w-8"
                >
                  <Trash2 size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {unsavedChanges && isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="h-8"
                  >
                    <Save size={16} className="mr-1" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="border-l h-6 mx-2 border-border" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isEditing ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setIsEditing(true);
                    setViewMode('edit');
                  }}
                  className="h-8 w-8"
                >
                  <Edit2 size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!isEditing ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => {
                    if (unsavedChanges) {
                      handleSave();
                    }
                    setIsEditing(false);
                    setViewMode('preview');
                  }}
                  className="h-8 w-8"
                >
                  <Eye size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {showSearch && (
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <Input
            placeholder="Search in note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>
            Search
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={prevSearchResult}
            disabled={searchResults.length === 0}
          >
            Prev
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={nextSearchResult}
            disabled={searchResults.length === 0}
          >
            Next
          </Button>
          {searchResults.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {currentSearchIndex + 1} of {searchResults.length}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setShowSearch(false)}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      <div className="px-4 py-2 border-b border-border flex flex-wrap items-center gap-1.5">
        {currentNote.tags.map((tagName) => {
          const tag = tags.find((t) => t.name === tagName);
          return (
            <Badge
              key={tagName}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
              style={{
                backgroundColor: tag ? `${tag.color}20` : undefined,
                color: tag ? tag.color : undefined,
                borderColor: tag ? `${tag.color}40` : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag?.color }} />
              {tag?.displayName || tagName}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 ml-1 p-0 hover:bg-transparent"
                  onClick={() => removeTagFromNote(currentNote.id, tagName)}
                >
                  <X size={10} />
                </Button>
              )}
            </Badge>
          );
        })}
        
        {isEditing && (
          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs flex items-center gap-1 bg-secondary/40"
              >
                <Plus size={12} />
                <span>Add Tag</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Add a tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Or select from existing tags:
                    </h5>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {tags
                        .filter((tag) => !currentNote.tags.includes(tag.name))
                        .map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className={cn(
                              "cursor-pointer flex items-center gap-1",
                              "hover:bg-accent"
                            )}
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              borderColor: `${tag.color}40`,
                            }}
                            onClick={() => {
                              addTagToNote(currentNote.id, tag.name);
                              setTagPopoverOpen(false);
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.displayName}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{currentNote.title}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={attachmentsDialogOpen} onOpenChange={setAttachmentsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            {currentNote.attachments && currentNote.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {currentNote.attachments.map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className="border rounded-md p-2 flex flex-col"
                  >
                    <div className="flex-1 mb-2">
                      {attachment.type.startsWith('image/') ? (
                        <div className="relative aspect-square overflow-hidden rounded-md mb-1">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-secondary/40 rounded-md flex items-center justify-center mb-1">
                          <Paperclip className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs truncate font-medium">{attachment.name}</p>
                    </div>
                    <div className="flex justify-between mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mr-1"
                        onClick={() => insertAttachmentLink(attachment)}
                      >
                        Insert
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => openAttachment(attachment)}
                      >
                        <ExternalLink size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => deleteAttachment(currentNote.id, attachment.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No attachments yet. Upload an attachment or paste an image.
              </p>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={16} className="mr-2" />
              Add Attachment
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setAttachmentsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageTags open={manageTagsOpen} onOpenChange={setManageTagsOpen} />
    </div>
  );
};

export default NoteEditor;
