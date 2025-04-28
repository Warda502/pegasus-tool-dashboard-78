
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search") || "Search files..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{t("uploadFile")}</span>
          </Button>
          <Button
            variant="outline"
            className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
            onClick={() => createFolder(prompt(t("enterFolderName")) || '')}
          >
            <FolderPlus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{t("newFolder")}</span>
          </Button>
        </div>
      </div>

      {currentPath && (
        <Button variant="ghost" onClick={navigateUp} className="gap-2 text-sm w-full sm:w-auto justify-start">
          ../ {t("upOneLevel")}
        </Button>
      )}

      <ScrollArea className="h-[calc(100vh-420px)] sm:h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.name}
              className="flex items-center justify-between p-2 sm:p-4 hover:bg-accent transition-colors text-sm"
            >
              <div
                className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden"
                onClick={() => file.isFolder && navigateToFolder(file.name)}
              >
                {file.isFolder ? (
                  <Folder className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <File className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!file.isFolder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file.name)}
                    className="h-7 w-7 p-0"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(file.name, file.isFolder)}
                  className="h-7 w-7 p-0 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="text-xs sm:text-sm text-muted-foreground">
        {t("totalFiles")}: {filteredFiles.length}
      </div>
    </div>
  );
}
