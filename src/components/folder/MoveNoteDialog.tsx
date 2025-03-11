
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder } from '@/types';

interface MoveNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  onMoveNote: () => void;
}

const MoveNoteDialog: React.FC<MoveNoteDialogProps> = ({
  open,
  onOpenChange,
  folders,
  targetFolderId,
  setTargetFolderId,
  onMoveNote,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Note to Another Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="folder-select" className="text-sm font-medium">
              Select Destination Folder
            </label>
            <Select value={targetFolderId} onValueChange={setTargetFolderId}>
              <SelectTrigger id="folder-select">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onMoveNote}
            disabled={!targetFolderId}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveNoteDialog;
