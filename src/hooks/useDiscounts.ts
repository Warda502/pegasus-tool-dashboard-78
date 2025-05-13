
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

// Add hook for managing offers
export function useOffers() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!user || !isAdmin) {
        console.log("User is not admin or not authenticated");
        return [];
      }

      console.log("Fetching offers data");
      
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching offers:', error);
        toast.error(t("errorFetchingData") || "Error fetching data");
        throw error;
      }
      
      // Process offers to check for expired status
      const currentDate = new Date();
      const processedOffers = data?.map(offer => {
        const isExpired = offer.expiry_at ? new Date(offer.expiry_at) < currentDate : false;
        return {
          ...offer,
          status: isExpired ? "expired" : (offer.status || "active")
        };
      }) || [];

      console.log(`Fetched ${processedOffers.length} offer records`);
      return processedOffers;
    },
    enabled: !!user && isAdmin
  });
}
