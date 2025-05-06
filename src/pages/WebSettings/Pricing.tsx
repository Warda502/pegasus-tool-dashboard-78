
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash, Check, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
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

type PricingPlan = {
  id: string;
  name_plan: string;
  price: string;
  features: string;
  perks: string;
};

export default function Pricing() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  
  const [formData, setFormData] = useState<Omit<PricingPlan, 'id'>>({
    name_plan: '',
    price: '',
    features: '',
    perks: ''
  });

  // Fetch pricing plans
  const { data: pricingPlans = [], isLoading } = useQuery({
    queryKey: ['pricingPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('*');
      
      if (error) {
        toast.error(t("fetchError"), {
          description: error.message
        });
        throw error;
      }
      
      return data as PricingPlan[];
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: Omit<PricingPlan, 'id'>) => {
      const { error } = await supabase
        .from('pricing')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast.success(t("addSuccess") || "Add successful", {
        description: t("planAdded") || "Pricing plan has been added successfully"
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(t("addError") || "Add failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Omit<PricingPlan, 'id'> }) => {
      const { error } = await supabase
        .from('pricing')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast.success(t("updateSuccess") || "Update successful", {
        description: t("planUpdated") || "Pricing plan has been updated successfully"
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t("updateError") || "Update failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast.success(t("deleteSuccess") || "Delete successful", {
        description: t("planDeleted") || "Pricing plan has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t("deleteError") || "Delete failed", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name_plan: '',
      price: '',
      features: '',
      perks: ''
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlan = () => {
    // Basic validation
    if (!formData.name_plan.trim() || !formData.price.trim()) {
      toast.error(t("validationError") || "Validation Error", {
        description: t("nameAndPriceRequired") || "Plan name and price are required"
      });
      return;
    }

    addMutation.mutate(formData);
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name_plan: plan.name_plan,
      price: plan.price,
      features: plan.features,
      perks: plan.perks
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (!selectedPlan) return;
    
    // Basic validation
    if (!formData.name_plan.trim() || !formData.price.trim()) {
      toast.error(t("validationError") || "Validation Error", {
        description: t("nameAndPriceRequired") || "Plan name and price are required"
      });
      return;
    }

    updateMutation.mutate({
      id: selectedPlan.id,
      data: formData
    });
  };

  const handleDeletePlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      deleteMutation.mutate(selectedPlan.id);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("pricing") || "Pricing"}</CardTitle>
            <CardDescription>
              {t("pricingDescription") || "Manage pricing plans for the application"}
            </CardDescription>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addPricingPlan") || "Add Pricing Plan"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-3 text-center py-10">
                {t("loading") || "Loading..."}
              </div>
            ) : pricingPlans.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                {t("noPricingPlans") || "No pricing plans defined yet"}
              </div>
            ) : (
              pricingPlans.map((plan) => (
                <Card key={plan.id} className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{plan.name_plan}</CardTitle>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPlan(plan)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlan(plan)}
                          className="h-7 w-7"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">${plan.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{t("features") || "Features"}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.features}</p>
                      </div>
                      {plan.perks && (
                        <div>
                          <h4 className="font-semibold mb-2">{t("perks") || "Perks"}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.perks}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addPricingPlan") || "Add Pricing Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("planName") || "Plan Name"}*</label>
              <Input
                value={formData.name_plan}
                onChange={(e) => handleInputChange("name_plan", e.target.value)}
                placeholder="e.g., Basic, Premium, Pro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("price") || "Price"}*</label>
              <Input
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="e.g., 9.99"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("features") || "Features"}</label>
              <Textarea
                value={formData.features}
                onChange={(e) => handleInputChange("features", e.target.value)}
                placeholder="Enter features, one per line"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {t("featuresHelp") || "Add each feature on a new line"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("perks") || "Perks"}</label>
              <Textarea
                value={formData.perks}
                onChange={(e) => handleInputChange("perks", e.target.value)}
                placeholder="Enter additional perks, one per line"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleAddPlan}>
              {t("add") || "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editPricingPlan") || "Edit Pricing Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("planName") || "Plan Name"}*</label>
              <Input
                value={formData.name_plan}
                onChange={(e) => handleInputChange("name_plan", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("price") || "Price"}*</label>
              <Input
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("features") || "Features"}</label>
              <Textarea
                value={formData.features}
                onChange={(e) => handleInputChange("features", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("perks") || "Perks"}</label>
              <Textarea
                value={formData.perks}
                onChange={(e) => handleInputChange("perks", e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleUpdatePlan}>
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
              {t("confirmDeletePlan", { name: selectedPlan?.name_plan }) || 
                `Are you sure you want to delete the "${selectedPlan?.name_plan}" plan?`}
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
