import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
type SupportedModel = {
  id: string;
  brand: string;
  model: string;
  carrier: string;
  operation: string;
  security: string;
};
export default function SupportedModels() {
  const {
    t,
    isRTL
  } = useLanguage();
  const queryClient = useQueryClient();
  const [modelFilter, setModelFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SupportedModel | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [formData, setFormData] = useState<Omit<SupportedModel, 'id'>>({
    brand: '',
    model: '',
    carrier: '',
    operation: '',
    security: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch supported models
  const {
    data: models = [],
    isLoading
  } = useQuery({
    queryKey: ['supportedModels'],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('supported_models').select('*');
        if (error) {
          console.error("Error fetching models:", error);
          toast.error(t("fetchError") || "Error fetching models");
          throw error;
        }
        return data as SupportedModel[];
      } catch (err) {
        console.error("Exception in fetch:", err);
        toast.error(t("fetchError") || "Error fetching models");
        return [];
      }
    }
  });

  // Upload mutation (batch insert)
  const uploadMutation = useMutation({
    mutationFn: async (data: Omit<SupportedModel, 'id'>[]) => {
      try {
        console.log("Uploading data:", data);
        const {
          data: result,
          error
        } = await supabase.from('supported_models').insert(data);
        if (error) {
          console.error("Upload error:", error);
          throw error;
        }
        return result;
      } catch (err) {
        console.error("Exception in upload:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supportedModels']
      });
      toast.success(t("uploadSuccess") || "Models uploaded successfully");
      setIsUploadDialogOpen(false);
      setJsonData("");
    },
    onError: error => {
      console.error("Error in mutation handler:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t("uploadError") || "Failed to upload models", {
        description: errorMessage
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Omit<SupportedModel, 'id'>;
    }) => {
      const {
        error
      } = await supabase.from('supported_models').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supportedModels']
      });
      toast.success(t("updateSuccess") || "Model updated successfully");
      setIsEditDialogOpen(false);
    },
    onError: error => {
      toast.error(t("updateError") || "Failed to update model", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('supported_models').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supportedModels']
      });
      toast.success(t("deleteSuccess") || "Model deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: error => {
      toast.error(t("deleteError") || "Failed to delete model", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });
  const handleEditModel = (model: SupportedModel) => {
    setSelectedModel(model);
    setFormData({
      brand: model.brand,
      model: model.model,
      carrier: model.carrier || '',
      operation: model.operation || '',
      security: model.security || ''
    });
    setIsEditDialogOpen(true);
  };
  const handleDeleteModel = (model: SupportedModel) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  };
  const handleUpdateModel = () => {
    if (!selectedModel) return;

    // Basic validation
    if (!formData.brand.trim() || !formData.model.trim()) {
      toast.error(t("validationError") || "Validation Error", {
        description: t("brandAndModelRequired") || "Brand and model are required"
      });
      return;
    }
    updateMutation.mutate({
      id: selectedModel.id,
      data: formData
    });
  };
  const confirmDelete = () => {
    if (selectedModel) {
      deleteMutation.mutate(selectedModel.id);
    }
  };
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleUploadData = () => {
    if (!jsonData.trim()) {
      toast.error(t("noDataError") || "No data provided", {
        description: t("pleaseEnterJsonData") || "Please enter JSON data to upload"
      });
      return;
    }
    try {
      const parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData)) {
        toast.error(t("invalidFormat") || "Invalid format", {
          description: t("dataMustBeArray") || "Data must be an array of objects"
        });
        return;
      }

      // Remove any id fields that might be in the input data to avoid conflicts
      const validData = parsedData.filter(item => item && typeof item === 'object' && item.brand && item.model).map(item => ({
        brand: String(item.brand),
        model: String(item.model),
        carrier: item.carrier ? String(item.carrier) : '',
        operation: item.operation ? String(item.operation) : '',
        security: item.security ? String(item.security) : ''
      }));
      if (validData.length === 0) {
        toast.error(t("invalidData") || "Invalid data", {
          description: t("noValidModelsFound") || "No valid models found in the data"
        });
        return;
      }
      console.log("Prepared data for upload:", validData);
      uploadMutation.mutate(validData);
    } catch (error) {
      console.error("JSON parse error:", error);
      toast.error(t("invalidJson") || "Invalid JSON", {
        description: t("pleaseCheckFormat") || "Please check the format of your JSON data"
      });
    }
  };

  // Filter models based on search inputs
  const filteredModels = models.filter(model => {
    const matchesModel = modelFilter === "" || model.model.toLowerCase().includes(modelFilter.toLowerCase());
    const matchesBrand = brandFilter === "" || model.brand.toLowerCase().includes(brandFilter.toLowerCase());
    return matchesModel && matchesBrand;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredModels.length);
  const currentPageData = filteredModels.slice(startIndex, endIndex);

  // Go to specific page
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };
  return <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("supportedModels") || "Supported Models"}</CardTitle>
            <CardDescription className="mx-0 my-[4px]">
              {t("supportedModelsDescription") || "Manage supported device models"}
            </CardDescription>
          </div>
          <Button 
            variant="outline"
            className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
            onClick={() => setIsUploadDialogOpen(true)}
            >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            {t("uploadModels") || "Upload Models"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input placeholder={t("filterByBrand") || "Filter by brand..."} value={brandFilter} onChange={e => setBrandFilter(e.target.value)} />
              </div>
              <div className="flex-1">
                <Input placeholder={t("filterByModel") || "Filter by model..."} value={modelFilter} onChange={e => setModelFilter(e.target.value)} />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("brand") || "Brand"}</TableHead>
                    <TableHead>{t("model") || "Model"}</TableHead>
                    <TableHead>{t("carrier") || "Carrier"}</TableHead>
                    <TableHead>{t("operation") || "Operation"}</TableHead>
                    <TableHead>{t("security") || "Security"}</TableHead>
                    <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow> : currentPageData.length === 0 ? <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        {modelFilter || brandFilter ? t("noModelsFound") || "No models matching your filter" : t("noModels") || "No models available"}
                      </TableCell>
                    </TableRow> : currentPageData.map(model => <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.brand}</TableCell>
                        <TableCell>{model.model}</TableCell>
                        <TableCell>{model.carrier || "-"}</TableCell>
                        <TableCell>{model.operation || "-"}</TableCell>
                        <TableCell>{model.security || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditModel(model)} className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model)} className="h-8 w-8 text-destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {filteredModels.length > itemsPerPage && <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t("showingResults") || "Showing"} {startIndex + 1} - {endIndex} {t("of") || "of"} {filteredModels.length}
                </div>
                <Pagination className="mt-0">
                  <PaginationContent className="flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious onClick={() => goToPage(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                    
                    {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map(page => {
                  // Always show first page, current page, last page, and pages adjacent to current
                  const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

                  // Show ellipsis where there are gaps
                  const showLeftEllipsis = page === currentPage - 2 && currentPage > 3;
                  const showRightEllipsis = page === currentPage + 2 && currentPage < totalPages - 2;
                  if (showLeftEllipsis) {
                    return <PaginationEllipsis key={`ellipsis-left-${page}`} />;
                  }
                  if (showRightEllipsis) {
                    return <PaginationEllipsis key={`ellipsis-right-${page}`} />;
                  }
                  if (shouldShow) {
                    return <PaginationItem key={page}>
                            <PaginationLink onClick={() => goToPage(page)} isActive={currentPage === page} className="cursor-pointer">
                              {page}
                            </PaginationLink>
                          </PaginationItem>;
                  }
                  return null;
                })}
                    
                    <PaginationItem>
                      <PaginationNext onClick={() => goToPage(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("uploadModels") || "Upload Models"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t("uploadInstructions") || "Paste JSON data below to import models."}
            </p>
            <Textarea value={jsonData} onChange={e => setJsonData(e.target.value)} placeholder={`[
  {
    "brand": "Samsung",
    "model": "SM-A136U",
    "carrier": "ATT,CHA",
    "security": "All",
    "operation": "Direct Unlock"
  }
]`} rows={10} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleUploadData}>
              {t("upload") || "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editModel") || "Edit Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("brand") || "Brand"}</label>
              <Input value={formData.brand} onChange={e => handleInputChange("brand", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("model") || "Model"}</label>
              <Input value={formData.model} onChange={e => handleInputChange("model", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("carrier") || "Carrier"}</label>
              <Input value={formData.carrier} onChange={e => handleInputChange("carrier", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("operation") || "Operation"}</label>
              <Input value={formData.operation} onChange={e => handleInputChange("operation", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("security") || "Security"}</label>
              <Input value={formData.security} onChange={e => handleInputChange("security", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleUpdateModel}>
              {t("save") || "Save"}
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
              {t("confirmDeleteModel") || `Are you sure you want to delete the ${selectedModel?.brand} ${selectedModel?.model} model?`}
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
    </div>;
}
