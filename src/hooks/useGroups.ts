
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";

export function useGroups() {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!user || !isAdmin) {
        console.log("User is not admin or not authenticated");
        return [];
      }

      console.log("Fetching groups data");
      
      const { data, error } = await supabase
        .from('groups')
        .select('*');
      
      if (error) {
        console.error('Error fetching groups:', error);
        toast.error(t("errorFetchingData") || "Error fetching data");
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} group records`);
      return data || [];
    },
    enabled: !!user && isAdmin
  });
}
