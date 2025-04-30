
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";

export function useUserCertFiles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userCertFiles', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      // Debug log to help identify issues
      console.log("Fetching cert files for user:", user.id);

      const { data, error } = await supabase
        .from('certsave')
        .select('*')
        .eq('uid', user.id);

      if (error) {
        console.error('Error fetching user cert files data:', error);
        throw error;
      }

      console.log("Fetched cert files data:", data);
      return data || [];
    },
    enabled: !!user
  });
}
