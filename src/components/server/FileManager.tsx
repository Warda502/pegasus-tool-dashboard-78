
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { Upload, Trash2, FolderPlus, Folder, File, Download } from "lucide-react";
import { useFileManager } from "@/hooks/useFileManager";

export function FileManager() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    files,
    currentPath,
    isLoading,
    uploadFile,
    createFolder,
    deleteItem,
    navigateToFolder,
    navigateUp,
    downloadFile,
  } = useFileManager();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0], currentPath);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder={t("search") || "Search files..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          {t("uploadFile") || "Upload File"}
        </Button>
        <Button onClick={() => createFolder(prompt(t("enterFolderName") || "Enter folder name:") || '')}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {t("newFolder") || "New Folder"}
        </Button>
      </div>

      {currentPath && (
        <Button variant="ghost" onClick={navigateUp}>
          ../ {t("upOneLevel") || "Up one level"}
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-2" onClick={() => file.isFolder && navigateToFolder(file.name)}>
              {file.isFolder ? (
                <Folder className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
              <span>{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {!file.isFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(file.name)}
                  className="hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteItem(file.name, file.isFolder)}
                className="hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
