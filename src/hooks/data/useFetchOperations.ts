
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "./types";
import { useAuth } from "../auth/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";

// Cache configuration
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

export const fetchOperations = async (isAdmin: boolean, userId: string | undefined): Promise<Operation[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log(`Fetching operations (isAdmin: ${isAdmin}, userId: ${userId || 'unknown'})`);
  
  try {
    let allOperations: any[] = [];
    
    // For admin users, use a more efficient pagination approach with smaller page size
    const pageSize = isAdmin ? 100 : 1000; // Smaller page size for admins to prevent stack depth issues
    let page = 0;
    let hasMore = true;
    let maxPages = isAdmin ? 50 : 10; // Limit the maximum pages to prevent excessive requests
    
    while (hasMore && page < maxPages) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`Fetching operations batch ${page + 1}, range: ${from}-${to}`);
      
      // Add a small delay between admin requests to prevent stack overflows
      if (isAdmin && page > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      let query = supabase
        .from('operations')
        .select('*')
        .range(from, to)
        .order('time', { ascending: false });
      
      if (!isAdmin && userId) {
        // Check if UID matches user.id
        query = query.eq('uid', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching operations batch ${page + 1}:`, error);
        // Don't throw error to prevent breaking the entire fetch - just log and continue
        if (page > 0) {
          hasMore = false; // Stop if we've fetched at least one batch
        } else {
          throw new Error("Failed to fetch operations");
        }
      }
      
      if (data && data.length > 0) {
        allOperations = [...allOperations, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
      
      page++;
    }

    console.log(`Total operations fetched: ${allOperations.length}`);
    
    // Map the operations after fetching all data
    return allOperations.map(op => ({
      operation_id: op.operation_id,
      OprationID: op.operation_id,
      OprationTypes: op.operation_type,
      Phone_SN: op.phone_sn,
      Brand: op.brand,
      Model: op.model,
      Imei: op.imei,
      UserName: op.username,
      Credit: op.credit || "0.0",
      Time: op.time,
      Status: op.status,
      Android: op.android,
      Baseband: op.baseband,
      Carrier: op.carrier,
      Security_Patch: op.security_patch,
      UID: op.uid,
      Hwid: op.hwid,
      LogOpration: null
    }));
  } catch (error) {
    console.error("Error in fetchOperations:", error);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};

export const useFetchOperations = () => {
  const { isAdmin, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const { 
    data = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['operations', isAdmin, user?.id],
    queryFn: () => fetchOperations(isAdmin, user?.id),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnMount: true, 
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && !!user?.id, // Only run if user is authenticated and has ID
    retry: isAdmin ? 1 : 2, // Fewer retries for admin to prevent stack issues
    meta: {
      onError: (error) => {
        console.error("Error loading operations:", error);
        toast("Error", {
          description: t("failedToLoadOperations") || "Failed to load operations data"
        });
      }
    }
  });

  return {
    operations: data,
    isLoading,
    isError,
    refetch
  };
};
