
export interface Folder {
  id: string;
  name: string;
  path: string;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  noteId: string;
  createdAt: Date;
  size?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  displayName: string;
}

export type ViewMode = 'edit' | 'preview' | 'split';

export interface SearchOptions {
  includeContent: boolean;
  includeTitles: boolean;
  includeTags: boolean;
  caseSensitive: boolean;
}
