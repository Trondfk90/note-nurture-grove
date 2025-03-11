
import React, { useState } from 'react';
import { useAppContext } from '@/store/appContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '@/types';

interface NoteTagsProps {
  note: Note;
}

const NoteTags: React.FC<NoteTagsProps> = ({ note }) => {
  const { tags, addTagToNote, removeTagFromNote, isEditing } = useAppContext();
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (note && newTagName.trim()) {
      addTagToNote(note.id, newTagName.trim());
      setNewTagName('');
      setTagPopoverOpen(false);
    }
  };

  return (
    <div className="px-4 py-2 border-b border-border flex flex-wrap items-center gap-1.5">
      {note.tags.map((tagName) => {
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
                onClick={() => removeTagFromNote(note.id, tagName)}
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
                      .filter((tag) => !note.tags.includes(tag.name))
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
                            addTagToNote(note.id, tag.name);
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
  );
};

export default NoteTags;
