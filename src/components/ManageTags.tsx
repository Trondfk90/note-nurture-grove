
import React, { useState } from 'react';
import { useAppContext } from '@/store/appContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Save, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tag } from '@/types';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface ManageTagsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageTags: React.FC<ManageTagsProps> = ({ open, onOpenChange }) => {
  const { tags, createTag, updateTag, deleteTag } = useAppContext();
  
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4CAF50');
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.displayName || tag.name);
    setEditTagColor(tag.color);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName('');
    setEditTagColor('');
  };

  const handleSaveEdit = () => {
    if (editingTag && editTagName.trim()) {
      updateTag(editingTag.id, editTagName, editTagColor);
      setEditingTag(null);
      setEditTagName('');
      setEditTagColor('');
    }
  };

  const handleDelete = (tagId: string) => {
    setDeleteTagId(tagId);
  };

  const confirmDelete = () => {
    if (deleteTagId) {
      deleteTag(deleteTagId);
      setDeleteTagId(null);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName, newTagColor);
      setNewTagName('');
      setNewTagColor('#4CAF50');
    }
  };

  const predefinedColors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#F44336', // Red
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#795548', // Brown
    '#607D8B', // Gray
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, or delete tags. Changes will affect all notes using these tags.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-5">
            {/* Add new tag */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add New Tag</h3>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full border-2",
                        newTagColor === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <Button onClick={handleAddTag} size="sm" className="gap-1">
                  <Plus size={16} />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Existing tags */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Existing Tags</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags created yet.</p>
                ) : (
                  tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                      {editingTag?.id === tag.id ? (
                        <>
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editTagName}
                              onChange={(e) => setEditTagName(e.target.value)}
                              className="flex-1"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              {predefinedColors.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  className={cn(
                                    "w-6 h-6 rounded-full border-2",
                                    editTagColor === color ? "border-primary" : "border-transparent"
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setEditTagColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8">
                              <X size={16} />
                            </Button>
                            <Button variant="default" size="icon" onClick={handleSaveEdit} className="h-8 w-8">
                              <Save size={16} />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1 text-sm"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                borderColor: `${tag.color}40`,
                              }}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                              {tag.displayName || tag.name}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleStartEdit(tag)} className="h-8 w-8">
                              <Pencil size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)} className="h-8 w-8 text-destructive">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Tag Confirmation */}
      <AlertDialog open={!!deleteTagId} onOpenChange={(open) => !open && setDeleteTagId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tag from all notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageTags;
