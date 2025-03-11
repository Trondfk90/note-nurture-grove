
import { Note, Folder, Tag, Attachment, ViewMode } from '@/types';

export interface AppContextType {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
  currentFolder: Folder | null;
  currentNote: Note | null;
  searchQuery: string;
  isEditing: boolean;
  viewMode: ViewMode;
  showAIPanel: boolean;
  createFolder: (name: string, path: string) => void;
  updateFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  createNote: (folderId: string, title: string, content?: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  setCurrentFolder: (folderId: string) => void;
  setCurrentNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  updateNoteContent: (
    contentOrUpdater: string | ((prevContent: string) => string)
  ) => void;
  setIsEditing: (isEditing: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  createTag: (name: string, color: string) => void;
  updateTag: (id: string, name: string, color: string) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagName: string) => void;
  removeTagFromNote: (noteId: string, tagName: string) => void;
  setShowAIPanel: (show: boolean) => void;
  toggleFavorite: (noteId: string) => void;
  addAttachment: (noteId: string, file: File) => Promise<Attachment>;
  removeAttachment: (noteId: string, attachmentId: string) => void;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
  addTag: (name: string, color: string) => void;
  removeTag: (id: string) => void;
  moveNote: (noteId: string, targetFolderId: string) => void;
}
