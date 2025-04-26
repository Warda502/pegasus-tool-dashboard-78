
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "./types";
import { useAuth } from "../auth/AuthContext";

// Cache configuration
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

export const fetchOperations = async (isAdmin: boolean, userId: string | undefined): Promise<Operation[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log(`Fetching operations (isAdmin: ${isAdmin}, userId: ${userId || 'unknown'})`);
  
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
};

export const useFetchOperations = () => {
  const { isAdmin, isAuthenticated, user } = useAuth();

  const { 
    data = [], 
    isLoading 
  } = useQuery({
    queryKey: ['operations', isAdmin, user?.id],
    queryFn: () => fetchOperations(isAdmin, user?.id),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });

  return {
    operations: data,
    isLoading
  };
};
