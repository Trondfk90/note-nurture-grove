
import React from 'react';
import { AppProvider } from '@/store/appContext';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import FolderList from '@/components/FolderList';
import TagList from '@/components/TagList';
import NoteEditor from '@/components/NoteEditor';
import Toolbar from '@/components/Toolbar';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Toolbar />
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 bg-background"
        >
          <ResizablePanel
            defaultSize={15}
            minSize={10}
            maxSize={25}
            className="bg-sidebar"
          >
            <FolderList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
          >
            <TagList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <NoteEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppProvider>
  );
};

export default Index;
