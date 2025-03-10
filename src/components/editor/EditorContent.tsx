
import React, { useRef } from 'react';
import { useAppContext } from '@/store/appContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import CodeEditor, { CodeEditorRef } from '@/components/CodeEditor';
import MarkdownPreview from '@/components/MarkdownPreview';
import { Note, Attachment } from '@/types';

interface EditorContentProps {
  note: Note;
  editedContent: string;
  setEditedContent: (content: string) => void;
  setUnsavedChanges: (unsaved: boolean) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  textareaRef: React.RefObject<CodeEditorRef>;
  searchQuery: string;
  searchResults: Array<{index: number, line: number}>;
}

const EditorContent: React.FC<EditorContentProps> = ({
  note,
  editedContent,
  setEditedContent,
  setUnsavedChanges,
  handlePaste,
  textareaRef,
  searchQuery,
  searchResults,
}) => {
  const { viewMode, setViewMode, isEditing } = useAppContext();

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'edit' | 'preview' | 'split')}
        className="h-full flex flex-col"
      >
        <TabsList className="ml-4 mt-2">
          <TabsTrigger value="edit" disabled={!isEditing}>
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="split" disabled={!isEditing}>
            Split
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
          <ScrollArea className="h-full">
            <div onPaste={handlePaste} className="w-full h-full">
              <CodeEditor
                ref={textareaRef}
                value={editedContent}
                onChange={(value) => {
                  setEditedContent(value);
                  setUnsavedChanges(true);
                }}
                className="w-full h-full min-h-[calc(100vh-280px)]"
                placeholder="Write your note in Markdown... (Paste images directly into the editor)"
                disabled={!isEditing}
                highlightSearchMatches={searchResults.length > 0}
                searchQuery={searchQuery}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <MarkdownPreview 
                content={editedContent} 
                attachments={note.attachments}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="split" className="flex-1 p-0 m-0 h-[calc(100%-40px)]">
          <div className="grid grid-cols-2 h-full divide-x">
            <ScrollArea className="h-full">
              <div onPaste={handlePaste} className="w-full h-full">
                <CodeEditor
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(value) => {
                    setEditedContent(value);
                    setUnsavedChanges(true);
                  }}
                  className="w-full h-full min-h-[calc(100vh-280px)]"
                  placeholder="Write your note in Markdown... (Paste images directly into the editor)"
                  disabled={!isEditing}
                  highlightSearchMatches={searchResults.length > 0}
                  searchQuery={searchQuery}
                />
              </div>
            </ScrollArea>
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownPreview 
                  content={editedContent} 
                  attachments={note.attachments}
                />
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorContent;
