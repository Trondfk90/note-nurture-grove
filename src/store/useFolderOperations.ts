
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, Note } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fileSystemService } from '@/services/fileSystemService';
import { toast } from '@/components/ui/use-toast';

export const useFolderOperations = () => {
  const [folders, setFolders] = useLocalStorage<Folder[]>('folders', []);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    folders.length > 0 ? folders[0].id : null
  );

  const createFolder = async (name: string): Promise<string | null> => {
    // Open native folder selection dialog
    const folderPath = await fileSystemService.selectFolder();
    
    if (!folderPath) {
      toast({
        title: "Folder creation cancelled",
        description: "No folder location was selected."
      });
      return null;
    }

    const newFolder: Folder = { 
      id: uuidv4(), 
      name, 
      path: folderPath, 
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    setCurrentFolderId(newFolder.id);
    
    toast({
      title: "Folder created",
      description: `Folder "${name}" created at ${folderPath}`
    });
    
    return newFolder.id;
  };

  const updateFolder = (folder: Folder) => {
    setFolders((prevFolders) =>
      prevFolders.map((f) => (f.id === folder.id ? { ...f, ...folder, updatedAt: new Date() } : f))
    );
  };

  const deleteFolder = (id: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
    if (currentFolderId === id) {
      setCurrentFolderId(folders.length > 1 ? folders.find(f => f.id !== id)?.id || null : null);
    }
  };

  const setCurrentFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  return {
    folders,
    currentFolderId,
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder
  };
};
