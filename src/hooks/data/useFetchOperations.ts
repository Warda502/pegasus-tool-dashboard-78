
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
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`Fetching operations batch ${page + 1}, range: ${from}-${to}`);
      
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
        throw new Error("Failed to fetch operations");
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
    
    if (allOperations.length > 0) {
      // Log status values to debug
      const statuses = allOperations.map(op => op.status).filter(Boolean);
      const statusCounts = statuses.reduce((acc: any, status: string) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log("Operation status counts:", statusCounts);
      console.log("Sample operations:", allOperations.slice(0, 3).map(op => ({
        id: op.operation_id,
        status: op.status,
        uid: op.uid
      })));
    }

    return allOperations.map(op => ({
      // Map database fields to both naming conventions for compatibility
      id: op.operation_id,
      operation_id: op.operation_id,
      operation_type: op.operation_type,
      user_id: op.uid,
      created_at: op.time,
      status: op.status,
      credits: op.credit,
      user_email: op.username,
      // Also include legacy field names
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
      LogOpration: null // Placeholder for operation data
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
    enabled: isAuthenticated,
    retry: 2,
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
