
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

      const { data, error } = await supabase
        .from('certsave')
        .select('*')
        .eq('uid', user.id)
        .order('Imei');

      if (error) {
        console.error('Error fetching user cert files data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user
  });
}
