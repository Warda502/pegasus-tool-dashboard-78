
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/hooks/data/types";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";

interface PricingPlan {
  id: string;
  name_plan: string;
  price: string;
  features: string | null;
  perks: string | null;
  duration_months: string | null;
}

interface AddToPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddPlan: (userId: string, planName: string, duration: number) => Promise<boolean>;
}

export function AddToPlanDialog({ isOpen, onClose, users, onAddPlan }: AddToPlanDialogProps) {
  const { t, isRTL } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedPlanDuration, setSelectedPlanDuration] = useState<number>(1);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('pricing')
          .select('*');

        if (error) throw error;
        
        // Transform the data to ensure it matches the PricingPlan interface
        const transformedPlans: PricingPlan[] = data ? data.map(plan => ({
          id: plan.id,
          name_plan: plan.name_plan,
          price: plan.price || '',
          features: plan.features,
          perks: plan.perks,
          duration_months: plan.duration_months ? plan.duration_months.toString() : '1' // Ensure it's a string
        })) : [];
        
        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast(t("error") || "Error", {
          description: t("errorFetchingPlans") || "Failed to fetch available plans"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen, t]);

  // Update selected plan duration when plan changes
  useEffect(() => {
    if (selectedPlan) {
      const plan = plans.find(p => p.name_plan === selectedPlan);
      if (plan && plan.duration_months) {
        setSelectedPlanDuration(parseInt(plan.duration_months));
      } else {
        setSelectedPlanDuration(1); // Default to 1 month if not specified
      }
    }
  }, [selectedPlan, plans]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedPlan) {
      toast(t("error") || "Error", {
        description: t("selectUserAndPlan") || "Please select both a user and a plan"
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await onAddPlan(selectedUser, selectedPlan, selectedPlanDuration);
      
      if (success) {
        toast(t("success") || "Success", {
          description: t("planAddedToUser") || "Plan has been added to the user successfully"
        });
        handleClose();
      } else {
        toast(t("error") || "Error", {
          description: t("failedToAddPlan") || "Failed to add plan to user"
        });
      }
    } catch (error) {
      console.error("Error adding plan to user:", error);
      toast(t("error") || "Error", {
        description: t("errorAddingPlan") || "An error occurred while adding the plan"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedUser("");
    setSelectedPlan("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addUserPlan") || "Add Plan to User"}</DialogTitle>
          <DialogDescription>
            {t("selectUserAndPlanDescription") || "Select a user and a plan to assign"}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <Loading text={t("loadingPlans") || "Loading available plans..."} />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                {t("user") || "User"}
              </Label>
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("selectUser") || "Select user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id || ""}>
                      {user.Email || user.email} {user.Name || user.name ? `(${user.Name || user.name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                {t("plan") || "Plan"}
              </Label>
              <Select
                value={selectedPlan}
                onValueChange={setSelectedPlan}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("selectPlan") || "Select plan"} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name_plan}>
                      {plan.name_plan} {plan.price ? `- ${plan.price}` : ''} 
                      {plan.duration_months ? ` (${plan.duration_months} ${parseInt(plan.duration_months) === 1 ? 
                        (t("month") || "month") : 
                        (t("months") || "months")})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter dir="ltr">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
            {isSaving ? (t("saving") || "Saving...") : (t("addPlan") || "Add Plan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
