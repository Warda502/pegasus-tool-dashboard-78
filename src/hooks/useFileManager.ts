import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface FileInfo {
  name: string;
  isFolder: boolean;
}

export function useFileManager() {
  const [currentPath, setCurrentPath] = useState('');
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files', currentPath],
    queryFn: async () => {
      const { data: fileList, error } = await supabase
        .storage
        .from('services247')
        .list(currentPath);

      if (error) throw error;

      return fileList.map(file => ({
        name: file.name,
        isFolder: !file.metadata
      }));
    }
  });

  const uploadFile = useCallback(async (file: File, path: string) => {
    const fullPath = path ? `${path}/${file.name}` : file.name;
    
    try {
      const { error } = await supabase
        .storage
        .from('services247')
        .upload(fullPath, file);

      if (error) throw error;
      
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['files', currentPath] });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  }, [currentPath, queryClient]);

  const deleteItem = useCallback(async (name: string, isFolder: boolean) => {
    const fullPath = currentPath ? `${currentPath}/${name}` : name;
    
    try {
      if (isFolder) {
        // Recursively delete folder contents first
        const { data: files } = await supabase
          .storage
          .from('services247')
          .list(fullPath);

        if (files) {
          for (const file of files) {
            await supabase
              .storage
              .from('services247')
              .remove([`${fullPath}/${file.name}`]);
          }
        }
      }

      const { error } = await supabase
        .storage
        .from('services247')
        .remove([fullPath]);

      if (error) throw error;
      
      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['files', currentPath] });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  }, [currentPath, queryClient]);

  const createFolder = useCallback(async (folderName: string) => {
    if (!folderName) return;
    
    try {
      const fullPath = currentPath ? `${currentPath}/${folderName}/.keep` : `${folderName}/.keep`;
      
      const { error } = await supabase
        .storage
        .from('services247')
        .upload(fullPath, new Blob([]));

      if (error) throw error;
      
      toast.success('Folder created successfully');
      queryClient.invalidateQueries({ queryKey: ['files', currentPath] });
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
    }
  }, [currentPath, queryClient]);

  const navigateToFolder = useCallback((folderName: string) => {
    setCurrentPath(current => current ? `${current}/${folderName}` : folderName);
  }, []);

  const navigateUp = useCallback(() => {
    setCurrentPath(current => {
      const parts = current.split('/');
      parts.pop();
      return parts.join('/');
    });
  }, []);

  const downloadFile = useCallback(async (fileName: string) => {
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      
      const { data, error } = await supabase
        .storage
        .from('services247')
        .download(fullPath);

      if (error) throw error;
      
      // Create a URL for the file and trigger download
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t("fileDownloadedSuccessfully") || 'File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t("failedToDownloadFile") || 'Failed to download file');
    }
  }, [currentPath]);

  return {
    files,
    currentPath,
    isLoading,
    uploadFile,
    deleteItem,
    createFolder,
    navigateToFolder,
    navigateUp,
    downloadFile,
  };
}
