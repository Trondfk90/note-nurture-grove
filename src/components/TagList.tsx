
import React, { useState } from 'react';
import { Hash, Plus, X, Edit, MoreVertical, Check, Trash } from 'lucide-react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

const TagList: React.FC = () => {
  // Since currentTags doesn't exist in AppContextType, we'll use an empty array instead
  const { tags, removeTag, addTag, updateTag, currentNote } = useAppContext();
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4CAF50');
  const [selectedTags, setSelectedTags] = useState<string[]>(currentNote?.tags || []);
  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameTagValue, setRenameTagValue] = useState('');
  const [renameTagColor, setRenameTagColor] = useState('');

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName, newTagColor);
      setNewTagName('');
      setNewTagDialogOpen(false);
    }
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleRenameTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setRenamingTag(tagId);
      setRenameTagValue(tag.name);
      setRenameTagColor(tag.color);
    }
  };

  const handleSaveRenameTag = (tagId: string) => {
    if (renameTagValue.trim()) {
      const tag = tags.find(t => t.id === tagId);
      if (tag) {
        const formattedTagName = renameTagValue.toLowerCase().replace(/\s+/g, '-');
        updateTag(tagId, formattedTagName, renameTagColor);
        toast({
          title: "Tag renamed",
          description: `Tag has been renamed to ${formattedTagName}`,
        });
      }
    }
    setRenamingTag(null);
  };

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="font-semibold text-lg">Tags</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setNewTagDialogOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <div
                key={tag.id}
                className={cn(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-secondary/50 mb-1 group",
                  selectedTags.includes(tag.name) && "bg-secondary"
                )}
                onClick={() => handleTagClick(tag.name)}
              >
                {renamingTag === tag.id ? (
                  <div className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={renameTagColor}
                        onChange={(e) => setRenameTagColor(e.target.value)}
                        className="h-5 w-5 rounded-md cursor-pointer border border-input"
                      />
                      <Input
                        value={renameTagValue}
                        onChange={(e) => setRenameTagValue(e.target.value)}
                        className="h-7 text-sm py-0 px-1 flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRenameTag(tag.id);
                          if (e.key === 'Escape') setRenamingTag(null);
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1 p-0"
                      onClick={() => handleSaveRenameTag(tag.id)}
                    >
                      <Check size={14} className="text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => setRenamingTag(null)}
                    >
                      <X size={14} className="text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    <Hash size={14} className="mr-1.5" />
                    <span className="text-sm truncate flex-1">{tag.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleRenameTag(tag.id)}>
                          <Edit size={14} className="mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="py-2 px-2 text-sm text-muted-foreground italic">
              No tags yet
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New Tag Dialog */}
      <Dialog open={newTagDialogOpen} onOpenChange={setNewTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="h-10 w-10 rounded-md cursor-pointer border border-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewTagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateTag}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagList;
