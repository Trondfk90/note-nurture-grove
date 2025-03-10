
import React, { useState } from 'react';
import { Hash, Plus, X } from 'lucide-react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TagList: React.FC = () => {
  const { tags, currentTags, removeTag, addTag } = useAppContext();
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4CAF50');
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);

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
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                <Hash size={14} className="mr-1.5" />
                <span className="text-sm truncate flex-1">{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag.id);
                  }}
                >
                  <X size={14} />
                </Button>
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
