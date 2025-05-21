
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext"; // Direct import from AuthContext

// Cache configuration
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

let hasShownSuccessToast = false;

export const fetchUsers = async (isAdmin: boolean, currentUserId: string | undefined): Promise<User[]> => {
  console.log("fetchUsers called with:", { isAdmin, currentUserId });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error("No authentication session found in fetchUsers");
    throw new Error("No authentication session");
  }
  
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
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle();
      
      // If no results with id, try with uid field
      if ((!userData || Object.keys(userData).length === 0) || error) {
        console.log("User not found by id, trying with uid field");
        const { data: uidData, error: uidError } = await supabase
          .from('users')
          .select('*')
          .eq('uid', currentUserId)
          .maybeSingle();
          
        if (uidError) {
          console.error("Error fetching user by uid:", uidError);
          throw new Error("Failed to fetch user data");
        }
        
        if (uidData) {
          console.log("User found by UID:", uidData);
          return [mapUserData(uidData)];
        } else {
          console.error("No user data found for ID (tried both id and uid):", currentUserId);
          
          // One final attempt with auth.id from session directly
          const sessionUserId = session.user.id;
          if (sessionUserId && sessionUserId !== currentUserId) {
            console.log("Trying with session user ID:", sessionUserId);
            
            const { data: sessionUserData, error: sessionError } = await supabase
              .from('users')
              .select('*')
              .eq('id', sessionUserId)
              .maybeSingle();
              
            if (!sessionError && sessionUserData) {
              console.log("User found by session ID:", sessionUserData);
              return [mapUserData(sessionUserData)];
            }
          }
          
          return [];
        }
      }
      
      console.log("User data found by ID:", userData);
      return userData ? [mapUserData(userData)] : [];
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
  
  console.log("useFetchUsers auth state:", { isAuthenticated, isAdmin, userId: user?.id });

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
