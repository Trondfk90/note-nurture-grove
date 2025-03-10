
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
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  displayName: string; // Added displayName for case-sensitive display
}

export type ViewMode = 'edit' | 'preview' | 'split';

export interface SearchOptions {
  includeContent: boolean;
  includeTitles: boolean;
  includeTags: boolean;
  caseSensitive: boolean;
}
