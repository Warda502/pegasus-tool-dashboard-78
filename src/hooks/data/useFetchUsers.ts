
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

export const fetchUsers = async (isAdmin: boolean, currentUserId: string | undefined): Promise<User[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  if (!currentUserId) {
    console.error("No user ID provided for fetchUsers");
    throw new Error("User ID is required");
  }
  
  console.log(`Fetching users (isAdmin: ${isAdmin}, userId: ${currentUserId})`);
  
  try {
    // For regular users, only fetch their own data
    if (!isAdmin) {
      console.log("Regular user: fetching only their own data");
      
      // First try with auth.uid
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId);
      
      // If no results, try with uid field
      if ((!data || data.length === 0) && error) {
        console.log("User not found by id, trying with uid field");
        const { data: uidData, error: uidError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', currentUserId);
          
        if (uidError) {
          console.error("Error fetching user by uid:", uidError);
          throw new Error("Failed to fetch user data");
        }
        
        data = uidData;
      }
      
      console.log(`Fetched user data: ${data?.length || 0} records`);
      console.log("User data sample:", data?.length > 0 ? data[0] : "No user found");
      
      if (!data || data.length === 0) {
        console.error("No user data found for ID:", currentUserId);
        return [];
      }
      
      return data.map(user => mapUserData(user));
    }
    
    // For admins, fetch all users
    console.log("Admin user: fetching all users");
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
    
    console.log("Fetched users:", data?.length || 0);
    
    return data.map(user => mapUserData(user));
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    return [];
  }
};

// Helper function to map database user to UI user model
const mapUserData = (user: any): User => {
  return {
    ...user,
    Name: user.name || "",
    Email: user.email || "",
    Password: user.password || "",
    Phone: user.phone || "",
    Country: user.country || "",
    Activate: user.activate || "Not Activate",
    Block: user.block || "Not Blocked",
    Credits: user.credits || "0.0",
    User_Type: user.user_type || "Credits License",
    Email_Type: user.email_type || "User",
    Expiry_Time: user.expiry_time || "",
    Start_Date: user.start_date || "",
    Hwid: user.hwid || "",
    UID: user.uid || "",
    id: user.id,
    uid: user.uid
  };
};

export const useFetchUsers = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const { 
    data = [], 
    isLoading, 
    isError,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: ['users', isAdmin, user?.id],
    queryFn: () => fetchUsers(isAdmin, user?.id),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: isAuthenticated && !!user?.id,
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
