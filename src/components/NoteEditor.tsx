
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/store/appContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Edit2, Star, StarOff, Save, Hash, Trash2, X, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Note } from '@/types';
import MarkdownPreview from './MarkdownPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import CodeEditor from './CodeEditor';

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
  } = useAppContext();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{index: number, line: number}[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setAddTagDialogOpen(false);
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
      
      // Add +1 for the newline character
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
    
    // Set focus to the textarea
    textareaRef.current.focus();
    
    // Calculate the selection range
    const startPos = result.index;
    const endPos = startPos + searchQuery.length;
    
    // Set the selection range
    textareaRef.current.setSelectionRange(startPos, endPos);
    
    // Ensure the selected text is visible by scrolling to it
    const textarea = textareaRef.current;
    const lineHeight = 1.675 * 16; // Approximate line height in pixels
    const targetLine = result.line;
    textarea.scrollTop = (targetLine - 5) * lineHeight; // Scroll to a few lines above the target
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
                  onClick={() => setAddTagDialogOpen(true)}
                  className="h-8 w-8"
                >
                  <Hash size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add tag</TooltipContent>
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

      {currentNote.tags.length > 0 && (
        <div className="px-4 py-2 border-b border-border flex flex-wrap gap-1.5">
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
                {tagName}
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
        </div>
      )}

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
              <CodeEditor
                value={editedContent}
                onChange={(value) => {
                  setEditedContent(value);
                  setUnsavedChanges(true);
                }}
                className="w-full h-full min-h-[calc(100vh-280px)]"
                placeholder="Write your note in Markdown..."
                disabled={!isEditing}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownPreview content={editedContent} />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="split" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
            <div className="grid grid-cols-2 h-full divide-x">
              <ScrollArea className="h-full">
                <CodeEditor
                  value={editedContent}
                  onChange={(value) => {
                    setEditedContent(value);
                    setUnsavedChanges(true);
                  }}
                  className="w-full h-full min-h-[calc(100vh-280px)]"
                  placeholder="Write your note in Markdown..."
                  disabled={!isEditing}
                />
              </ScrollArea>
              <ScrollArea className="h-full">
                <div className="p-4">
                  <MarkdownPreview content={editedContent} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={addTagDialogOpen} onOpenChange={setAddTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              {tags.length > 0 && (
                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">Existing tags:</label>
                  <div className="flex flex-wrap gap-1.5">
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
                            setAddTagDialogOpen(false);
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddTagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddTag}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog */}
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
    </div>
  );
};

export default NoteEditor;
