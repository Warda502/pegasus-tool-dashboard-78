
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
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type SupportedModel = {
  id: string;
  brand: string;
  model: string;
  carrier: string;
  operation: string;
  security: string;
};

export default function SupportedModels() {
  const { t, isRTL } = useLanguage();
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
  
  // Fetch supported models
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['supportedModels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_models')
        .select('*');
      
      if (error) {
        toast.error(t("fetchError") || "Error fetching models");
        throw error;
      }
      
      return data as SupportedModel[];
    }
  });

  // Upload mutation (batch insert)
  const uploadMutation = useMutation({
    mutationFn: async (data: Omit<SupportedModel, 'id'>[]) => {
      const { error } = await supabase
        .from('supported_models')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportedModels'] });
      toast.success(t("uploadSuccess") || "Models uploaded successfully");
      setIsUploadDialogOpen(false);
      setJsonData("");
    },
    onError: (error) => {
      toast.error(t("uploadError") || "Failed to upload models", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Omit<SupportedModel, 'id'> }) => {
      const { error } = await supabase
        .from('supported_models')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportedModels'] });
      toast.success(t("updateSuccess") || "Model updated successfully");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t("updateError") || "Failed to update model", {
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
      toast.success(t("deleteSuccess") || "Model deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

      const validData = parsedData.filter(item => 
        item && typeof item === 'object' && 
        item.brand && item.model
      );

      if (validData.length === 0) {
        toast.error(t("invalidData") || "Invalid data", {
          description: t("noValidModelsFound") || "No valid models found in the data"
        });
        return;
      }

      uploadMutation.mutate(validData);
    } catch (error) {
      toast.error(t("invalidJson") || "Invalid JSON", {
        description: t("pleaseCheckFormat") || "Please check the format of your JSON data"
      });
    }
  };

  // Filter models based on search inputs
  const filteredModels = models.filter(model => {
    const matchesModel = modelFilter === "" || 
      model.model.toLowerCase().includes(modelFilter.toLowerCase());
    const matchesBrand = brandFilter === "" || 
      model.brand.toLowerCase().includes(brandFilter.toLowerCase());
    return matchesModel && matchesBrand;
  });

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("supportedModels") || "Supported Models"}</CardTitle>
            <CardDescription>
              {t("supportedModelsDescription") || "Manage supported device models"}
            </CardDescription>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t("uploadModels") || "Upload Models"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder={t("filterByBrand") || "Filter by brand..."}
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder={t("filterByModel") || "Filter by model..."}
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                />
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredModels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        {modelFilter || brandFilter ? 
                          (t("noModelsFound") || "No models matching your filter") :
                          (t("noModels") || "No models available")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModels.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.brand}</TableCell>
                        <TableCell>{model.model}</TableCell>
                        <TableCell>{model.carrier || "-"}</TableCell>
                        <TableCell>{model.operation || "-"}</TableCell>
                        <TableCell>{model.security || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditModel(model)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteModel(model)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
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
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={`[
  {
    "brand": "Samsung",
    "model": "SM-A136U",
    "carrier": "ATT,CHA",
    "security": "All",
    "operation": "Direct Unlock"
  }
]`}
              rows={10}
              className="font-mono text-xs"
            />
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
              <Input
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("model") || "Model"}</label>
              <Input
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("carrier") || "Carrier"}</label>
              <Input
                value={formData.carrier}
                onChange={(e) => handleInputChange("carrier", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("operation") || "Operation"}</label>
              <Input
                value={formData.operation}
                onChange={(e) => handleInputChange("operation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("security") || "Security"}</label>
              <Input
                value={formData.security}
                onChange={(e) => handleInputChange("security", e.target.value)}
              />
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
              {t("confirmDeleteModel") || 
                `Are you sure you want to delete the ${selectedModel?.brand} ${selectedModel?.model} model?`}
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
    </div>
  );
}
