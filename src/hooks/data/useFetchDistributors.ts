
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Distributor, User } from "./types";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";

// Cache configuration
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

export const fetchDistributors = async (): Promise<Distributor[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log("Fetching distributors");
  
  try {
    // First, fetch distributor records
    const { data: distributors, error: distributorsError } = await supabase
      .from('distributors')
      .select('*');
    
    if (distributorsError) {
      console.error("Error fetching distributors:", distributorsError);
      throw new Error("Failed to fetch distributors");
    }
    
    if (!distributors || distributors.length === 0) {
      console.log("No distributors found");
      return [];
    }
    
    // Extract user IDs from distributors
    const userIds = distributors
      .map(distributor => distributor.uid)
      .filter(Boolean) as string[];
    
    // Fetch corresponding user records
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('uid', userIds);
    
    if (usersError) {
      console.error("Error fetching distributors' user data:", usersError);
      throw new Error("Failed to fetch distributor user data");
    }
    
    // Map users to distributors
    const distributorsWithUserData = distributors.map(distributor => {
      const userData = users?.find(user => user.uid === distributor.uid) || null;
      return {
        ...distributor,
        user: userData
      };
    });

    console.log(`Total distributors fetched: ${distributorsWithUserData.length}`);
    return distributorsWithUserData;
  } catch (error) {
    console.error("Error in fetchDistributors:", error);
    return [];
  }
};

export const useFetchDistributors = () => {
  const { t } = useLanguage();

  const { 
    data = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['distributors'],
    queryFn: fetchDistributors,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnMount: true, 
    refetchOnWindowFocus: false,
    retry: 2,
    meta: {
      onError: (error) => {
        console.error("Error loading distributors:", error);
        toast("Error", {
          description: t("failedToLoadDistributors") || "Failed to load distributors data"
        });
      }
    }
  });

  return {
    distributors: data,
    isLoading,
    isError,
    refetch
  };
};
