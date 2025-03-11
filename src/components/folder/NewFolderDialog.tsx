
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  onCreateFolder: () => void;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  open,
  onOpenChange,
  folderName,
  setFolderName,
  onCreateFolder,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Enter a name for the folder. You'll be prompted to select where to create it on your computer.
          </p>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="col-span-3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onCreateFolder()}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onCreateFolder}>
            Create & Select Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;
