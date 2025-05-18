
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash, Check, Calendar } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type PricingPlan = {
  id: string;
  name_plan: string;
  price: string;
  features: string;
  perks: string;
  duration_months: string | null;
};

export default function Pricing() {
  const {
    t,
    isRTL
  } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState<Omit<PricingPlan, 'id'>>({
    name_plan: '',
    price: '',
    features: '',
    perks: '',
    duration_months: '1'
  });

  // Fetch pricing plans
  const {
    data: pricingPlans = [],
    isLoading
  } = useQuery({
    queryKey: ['pricingPlans'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('pricing').select('*');
      if (error) {
        toast.error(t("fetchError") || "Error fetching data");
        throw error;
      }
      return data as PricingPlan[];
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: Omit<PricingPlan, 'id'>) => {
      const {
        error
      } = await supabase.from('pricing').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pricingPlans']
      });
      toast.success(t("addSuccess") || "Plan added successfully");
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: error => {
      toast.error(t("addError") || "Failed to add plan", {
        description: error instanceof Error ? error.message : String(error)
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
      data: Omit<PricingPlan, 'id'>;
    }) => {
      const {
        error
      } = await supabase.from('pricing').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pricingPlans']
      });
      toast.success(t("updateSuccess") || "Plan updated successfully");
      setIsEditDialogOpen(false);
    },
    onError: error => {
      toast.error(t("updateError") || "Failed to update plan", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pricingPlans']
      });
      toast.success(t("deleteSuccess") || "Plan deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: error => {
      toast.error(t("deleteError") || "Failed to delete plan", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name_plan: '',
      price: '',
      features: '',
      perks: '',
      duration_months: '1'
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'duration_months' ? value.toString() : value
    }));
  };

  const handleAddPlan = () => {
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
      perks: plan.perks,
      duration_months: plan.duration_months || 1
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (!selectedPlan) return;
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

  // Helper function to parse features as an array
  const getFeaturesList = (featuresStr: string): string[] => {
    if (!featuresStr) return [];
    return featuresStr.split('\n').filter(feature => feature.trim());
  };

  return <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("pricingManagement") || "Pricing Management"}</CardTitle>
            <CardDescription className="my-[3px]">
              {t("pricingDescription") || "Take a look of our Pricing and select Your Choice"}
            </CardDescription>
          </div>
          <Button 
          variant="outline"
          className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
          onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
          }}
            >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            {t("addNewPlan") || "Add New Plan"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div> : pricingPlans.length === 0 ? <div className="text-center py-10 text-muted-foreground">
              {t("noPricingPlans") || "No pricing plans defined yet"}
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map(plan => <div key={plan.id} className="flex justify-center">
                  <Card className="overflow-hidden border border-muted shadow-lg relative group hover:shadow-xl transition-all w-full max-w-xs h-full">
                    {/* Edit and delete buttons (visible on hover) */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)} className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan)} className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold tracking-tight uppercase">
                          {plan.name_plan}
                        </h3>
                        <div className="mt-3 flex items-baseline justify-center">
                          <span className="text-3xl font-bold">$</span>
                          <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                        </div>
                        {plan.duration_months && (
                          <div className="flex items-center justify-center mt-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{plan.duration_months} {parseInt(plan.duration_months) === 1 ? (t("month") || "month") : (t("months") || "months")}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {getFeaturesList(plan.features || '').map((feature, idx) => <div key={idx} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span>{feature}</span>
                          </div>)}
                        
                        {plan.perks && getFeaturesList(plan.perks).map((perk, idx) => <div key={`perk-${idx}`} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span>{perk}</span>
                          </div>)}
                      </div>
                    </div>
                  </Card>
                </div>)}
            </div>}
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
              <Input value={formData.name_plan} onChange={e => handleInputChange("name_plan", e.target.value)} placeholder="e.g., CREDIT LICENSE, API PLAN" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("price") || "Price"}*</label>
              <Input value={formData.price} onChange={e => handleInputChange("price", e.target.value)} placeholder="e.g., 1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("duration") || "Duration"} ({t("months") || "Months"})*</label>
              <Input 
                type="number" 
                min="1" 
                value={formData.duration_months || '1'} 
                onChange={e => handleInputChange("duration_months", e.target.value)} 
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("features") || "Features"}</label>
              <Textarea value={formData.features} onChange={e => handleInputChange("features", e.target.value)} placeholder="Enter features, one per line" rows={4} />
              <p className="text-xs text-muted-foreground">
                {t("featuresHelp") || "Add each feature on a new line"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("perks") || "Additional Perks"}</label>
              <Textarea value={formData.perks} onChange={e => handleInputChange("perks", e.target.value)} placeholder="Enter additional perks, one per line" rows={3} />
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
              <Input value={formData.name_plan} onChange={e => handleInputChange("name_plan", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("price") || "Price"}*</label>
              <Input value={formData.price} onChange={e => handleInputChange("price", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("duration") || "Duration"} ({t("months") || "Months"})*</label>
              <Input 
                type="number" 
                min="1" 
                value={formData.duration_months || '1'} 
                onChange={e => handleInputChange("duration_months", e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("features") || "Features"}</label>
              <Textarea value={formData.features} onChange={e => handleInputChange("features", e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("perks") || "Additional Perks"}</label>
              <Textarea value={formData.perks} onChange={e => handleInputChange("perks", e.target.value)} rows={3} />
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
              {t("confirmDeletePlan") || `Are you sure you want to delete the "${selectedPlan?.name_plan}" plan?`}
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
