
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteName: string;
  setNoteName: (name: string) => void;
  onCreateNote: () => void;
}

const NewNoteDialog: React.FC<NewNoteDialogProps> = ({
  open,
  onOpenChange,
  noteName,
  setNoteName,
  onCreateNote,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Note title"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            className="col-span-3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onCreateNote()}
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
          <Button type="button" onClick={onCreateNote}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewNoteDialog;
