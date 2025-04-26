
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServerData() {
  return useQuery({
    queryKey: ['certsave'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certsave')
        .select('*')
        .order('Imei');

      if (error) {
        console.error('Error fetching certsave data:', error);
        throw error;
      }

      return data;
    }
  });
}
