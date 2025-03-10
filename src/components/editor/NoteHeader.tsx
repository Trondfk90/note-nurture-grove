
import React from 'react';
import { useAppContext } from '@/store/appContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Search, Paperclip, Image, Star, StarOff, Tags, Trash2, Save, Edit2, Eye } from 'lucide-react';
import { Note } from '@/types';

interface NoteHeaderProps {
  note: Note;
  editedTitle: string;
  setEditedTitle: (title: string) => void;
  unsavedChanges: boolean;
  handleSave: () => void;
  handleToggleFavorite: () => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setShowSearch: (show: boolean) => void;
  showSearch: boolean;
  setAttachmentsDialogOpen: (open: boolean) => void;
  setManageTagsOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setUnsavedChanges: (unsaved: boolean) => void;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({
  note,
  editedTitle,
  setEditedTitle,
  unsavedChanges,
  handleSave,
  handleToggleFavorite,
  setDeleteDialogOpen,
  setShowSearch,
  showSearch,
  setAttachmentsDialogOpen,
  setManageTagsOpen,
  fileInputRef,
  setUnsavedChanges,
}) => {
  const { isEditing, setIsEditing, setViewMode } = useAppContext();

  return (
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

        {isEditing && note.attachments && note.attachments.length > 0 && (
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
                {note.favorite ? (
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                ) : (
                  <StarOff size={18} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {note.favorite ? 'Remove from favorites' : 'Add to favorites'}
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
  );
};

export default NoteHeader;
