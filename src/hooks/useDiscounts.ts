
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";

export function useDiscounts() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      if (!user || !isAdmin) {
        console.log("User is not admin or not authenticated");
        return [];
      }

      console.log("Fetching discounts data");
      
      const { data, error } = await supabase
        .from('discounts')
        .select('*');
      
      if (error) {
        console.error('Error fetching discounts:', error);
        toast.error(t("errorFetchingData") || "Error fetching data");
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} discount records`);
      return data || [];
    },
    enabled: !!user && isAdmin
  });
}
