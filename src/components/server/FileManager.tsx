
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Upload, Trash2, FolderPlus, Folder, File, Download } from "lucide-react";
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
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search") || "Search files..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <Input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          {t("Upload File") || "Upload File"}
        </Button>
        <Button onClick={() => createFolder(prompt(t("enterFolderName") || "Enter folder name:") || '')}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {t("New Folder") || "New Folder"}
        </Button>
      </div>

      {currentPath && (
        <Button variant="ghost" onClick={navigateUp}>
          ../ {t("upOneLevel") || "Up one level"}
        </Button>
      )}

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.name}
              className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
            >
              <div
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => file.isFolder && navigateToFolder(file.name)}
              >
                {file.isFolder ? (
                  <Folder className="h-5 w-5" />
                ) : (
                  <File className="h-5 w-5" />
                )}
                <span className="truncate">{file.name}</span>
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
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        {t("Total Files") || "Total files"}: {filteredFiles.length}
      </div>
    </div>
  );
}
