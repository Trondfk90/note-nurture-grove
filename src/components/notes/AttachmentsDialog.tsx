
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Paperclip, Trash2, ExternalLink } from 'lucide-react';
import { Attachment } from '@/types';

interface AttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: Attachment[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  insertAttachmentLink: (attachment: Attachment) => void;
  openAttachment: (attachment: Attachment) => void;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
  noteId: string;
}

const AttachmentsDialog: React.FC<AttachmentsDialogProps> = ({
  open,
  onOpenChange,
  attachments,
  fileInputRef,
  insertAttachmentLink,
  openAttachment,
  deleteAttachment,
  noteId
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attachments</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[300px] overflow-y-auto">
          {attachments && attachments.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {attachments.map((attachment) => (
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
                      onClick={() => deleteAttachment(noteId, attachment.id)}
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
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsDialog;
