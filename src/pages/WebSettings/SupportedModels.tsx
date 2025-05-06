
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil, Upload, Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SupportedModel = {
  id: string;
  brand: string;
  model: string;
  carrier: string;
  security: string;
  operation: string;
  price?: string;
};

export default function SupportedModels() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SupportedModel | null>(null);
  const [editForm, setEditForm] = useState<Partial<SupportedModel>>({});
  const itemsPerPage = 10;

  // Fetch supported models
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['supportedModels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_models')
        .select('*');
      
      if (error) {
        toast.error(t("fetchError"), {
          description: error.message
        });
        throw error;
      }
      
      return data as SupportedModel[];
    }
  });

  // Filter models based on search
  const filteredModels = models.filter(model => 
    !searchTerm ||
    model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.security?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.operation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const { error } = await supabase
        .from('supported_models')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportedModels'] });
      toast.success(t("importSuccess") || "Import successful", {
        description: t("modelsImported") || "Models have been imported successfully"
      });
      setIsImportDialogOpen(false);
      setImportData("");
    },
    onError: (error) => {
      toast.error(t("importError") || "Import failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('supported_models')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportedModels'] });
      toast.success(t("deleteSuccess") || "Delete successful", {
        description: t("modelDeleted") || "Model has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t("deleteError") || "Delete failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<SupportedModel> }) => {
      const { error } = await supabase
        .from('supported_models')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportedModels'] });
      toast.success(t("updateSuccess") || "Update successful", {
        description: t("modelUpdated") || "Model has been updated successfully"
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t("updateError") || "Update failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const handleImport = () => {
    try {
      const jsonData = JSON.parse(importData);
      if (!Array.isArray(jsonData)) {
        toast.error(t("invalidFormat") || "Invalid format", {
          description: t("jsonArrayRequired") || "JSON must be an array of objects"
        });
        return;
      }
      
      // Validate structure of each object
      const isValid = jsonData.every(item => 
        typeof item === 'object' && 
        item.brand && 
        item.model && 
        item.operation
      );
      
      if (!isValid) {
        toast.error(t("invalidFormat") || "Invalid format", {
          description: t("requiredFieldsMissing") || "All items must have brand, model, and operation fields"
        });
        return;
      }
      
      importMutation.mutate(jsonData);
    } catch (error) {
      toast.error(t("invalidJson") || "Invalid JSON", {
        description: t("pleaseCheckFormat") || "Please check your JSON format"
      });
    }
  };

  const handleDelete = (model: SupportedModel) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedModel) {
      deleteMutation.mutate(selectedModel.id);
    }
  };

  const handleEdit = (model: SupportedModel) => {
    setSelectedModel(model);
    setEditForm({
      brand: model.brand,
      model: model.model,
      carrier: model.carrier,
      security: model.security,
      operation: model.operation,
      price: model.price
    });
    setIsEditDialogOpen(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const confirmEdit = () => {
    if (selectedModel && editForm) {
      updateMutation.mutate({ 
        id: selectedModel.id, 
        data: editForm 
      });
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("supportedModels") || "Supported Models"}</CardTitle>
            <CardDescription>
              {t("supportedModelsDescription") || "Manage device models supported by the system"}
            </CardDescription>
          </div>
          <Button onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t("importModels") || "Import Models"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search") || "Search..."}
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("brand") || "Brand"}</TableHead>
                    <TableHead>{t("model") || "Model"}</TableHead>
                    <TableHead>{t("carrier") || "Carrier"}</TableHead>
                    <TableHead>{t("security") || "Security"}</TableHead>
                    <TableHead>{t("operation") || "Operation"}</TableHead>
                    <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        {t("loading") || "Loading..."}
                      </TableCell>
                    </TableRow>
                  ) : paginatedModels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        {searchTerm ? 
                          (t("noResultsFound") || "No results found") : 
                          (t("noModelsYet") || "No models added yet")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedModels.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.brand}</TableCell>
                        <TableCell>{model.model}</TableCell>
                        <TableCell>{model.carrier}</TableCell>
                        <TableCell>{model.security}</TableCell>
                        <TableCell>{model.operation}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(model)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4 text-blue-500" />
                              <span className="sr-only">{t("edit")}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(model)}
                              className="h-8 w-8"
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                              <span className="sr-only">{t("delete")}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          <div className="text-sm text-muted-foreground">
            {filteredModels.length > 0 && (
              <span>
                {t("showingOf", { 
                  start: (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, filteredModels.length),
                  total: filteredModels.length
                }) || `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredModels.length)} of ${filteredModels.length} models`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importModels") || "Import Models"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("pasteJsonData") || "Paste your JSON data below:"}
            </p>
            <textarea
              className="w-full min-h-[150px] p-2 border rounded-md"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={`[
  {
    "brand": "Samsung",
    "model": "SM-A136U",
    "carrier": "ATT,CHA",
    "security": "All",
    "operation": "Direct Unlock"
  }
]`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              {t("import") || "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteModel", { brand: selectedModel?.brand, model: selectedModel?.model }) || 
                `Are you sure you want to delete ${selectedModel?.brand} ${selectedModel?.model}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              {t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("editModel") || "Edit Model"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("brand") || "Brand"}</label>
                <Input
                  value={editForm.brand || ""}
                  onChange={(e) => handleEditChange("brand", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("model") || "Model"}</label>
                <Input
                  value={editForm.model || ""}
                  onChange={(e) => handleEditChange("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("carrier") || "Carrier"}</label>
                <Input
                  value={editForm.carrier || ""}
                  onChange={(e) => handleEditChange("carrier", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("security") || "Security"}</label>
                <Input
                  value={editForm.security || ""}
                  onChange={(e) => handleEditChange("security", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("operation") || "Operation"}</label>
                <Input
                  value={editForm.operation || ""}
                  onChange={(e) => handleEditChange("operation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("price") || "Price"}</label>
                <Input
                  value={editForm.price || ""}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={confirmEdit}>
              {t("save") || "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
