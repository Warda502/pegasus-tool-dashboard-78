
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { useAuth } from "../auth/AuthContext";

// Cache configuration
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

let hasShownSuccessToast = false;

export const fetchUsers = async (): Promise<User[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log("Fetching users...");
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
    
    console.log("Fetched users:", data?.length || 0);
    console.log("User data sample:", data?.length > 0 ? data[0] : "No users");
    
    return data.map(user => {
      const creditsValue = user.credits ? user.credits.toString().replace(/"/g, '') : "0.0";
      
      return {
        ...user,
        Name: user.name || "",
        Email: user.email || "",
        Password: user.password || "",
        Phone: user.phone || "",
        Country: user.country || "",
        Activate: user.activate || "Not Activate",
        Block: user.block || "Not Blocked",
        Credits: creditsValue,
        User_Type: user.user_type || "Credits License",
        Email_Type: user.email_type || "User",
        Expiry_Time: user.expiry_time || "",
        Start_Date: user.start_date || "",
        Hwid: user.hwid || "",
        UID: user.uid || ""
      };
    });
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    // Return an empty array instead of throwing to prevent infinite loading
    return [];
  }
};

export const useFetchUsers = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { 
    data = [], 
    isLoading, 
    isError,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnMount: true, // Changed to true to ensure fresh data on mount
    refetchOnWindowFocus: false,
    retry: 2, // Increased retries
    enabled: isAuthenticated,
    meta: {
      onSuccess: (data) => {
        console.log("Users loaded successfully:", data.length);
        if (!hasShownSuccessToast) {
          toast(t("fetchSuccessTitle") || "Success", {
            description: t("fetchSuccessDescription") || "Data loaded successfully"
          });
          hasShownSuccessToast = true;
        }
      },
      onError: (error) => {
        console.error("Error loading users:", error);
        toast("Error", {
          description: "Failed to load user data"
        });
      }
    }
  });

  return {
    users: data,
    isLoading,
    isError,
    isSuccess,
    refetch
  };
};
