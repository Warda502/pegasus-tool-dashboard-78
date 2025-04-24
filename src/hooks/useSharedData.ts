import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLanguage } from "./useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";

// Define types based on Supabase database schema
type UserRow = Database['public']['Tables']['users']['Row'];
type OperationRow = Database['public']['Tables']['operations']['Row'];

// Extended User interface to match the structure used in the app
export interface User extends UserRow {
  Name: string; // Making this required to match expected usage in components
  Email: string;
  Password: string;
  Phone: string;
  Country: string;
  Activate: string;
  Block: string;
  Credits: string;
  User_Type: string;
  Email_Type: string;
  Expiry_Time: string;
  Start_Date: string;
  Hwid: string;
  UID: string;
  [key: string]: any;
}

// Extended Operation interface to match the structure used in the app
export interface Operation {
  operation_id?: string;
  OprationID?: string;
  OprationTypes?: string;
  Phone_SN?: string;
  Brand?: string;
  Model?: string;
  Imei?: string;
  UserName?: string;
  Credit?: string;
  Time?: string;
  Status?: string;
  Android?: string;
  Baseband?: string;
  Carrier?: string;
  Security_Patch?: string;
  UID?: string;
  Hwid?: string;
  LogOpration?: string; // Keep this for consistency with existing code
  [key: string]: any;
}

// Variable to track if the success toast has been shown
let hasShownSuccessToast = false;

const fetchUsers = async (): Promise<User[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log("Fetching users...");
  
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
  
  console.log("Fetched users:", data?.length || 0);
  
  return data.map(user => ({
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
    UID: user.uid || ""
  }));
};

// Modified function to fetch operations with pagination and user-specific filtering
const fetchOperations = async (isAdmin: boolean, userId: string | undefined): Promise<Operation[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No authentication session");
  
  console.log(`Fetching operations with pagination (isAdmin: ${isAdmin}, userId: ${userId || 'unknown'})`);
  
  let allOperations: any[] = [];
  let page = 0;
  const pageSize = 1000; // Supabase's maximum limit
  let hasMore = true;
  
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    console.log(`Fetching operations batch ${page + 1}, range: ${from}-${to}`);
    
    // Build the query with conditional filtering based on user role
    let query = supabase
      .from('operations')
      .select('*')
      .range(from, to)
      .order('time', { ascending: false });
    
    // If not admin and userId is available, filter by user ID
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

  console.log(`Total operations fetched across all batches: ${allOperations.length}`);

  // Map Supabase data to the structure expected by the app
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
    // Add LogOpration but don't reference op.log_operation since it doesn't exist
    LogOpration: null
  }));
};

// Helper function to format time strings
export const formatTimeString = (timeStr: string): string => {
  if (!timeStr) return "";
  
  // Convert Arabic AM/PM indicators to English
  const normalizedTime = timeStr
    .replace("-م", "-PM")
    .replace("-ص", "-AM");
  
  // Parse the date and format it
  try {
    const date = new Date(normalizedTime);
    return format(date, "yyyy/MM/dd hh:mm -aa");
  } catch {
    return timeStr;
  }
};

// Add credit to user function
export const addCreditToUser = async (userId: string, creditsToAdd: number): Promise<boolean> => {
  if (!userId || isNaN(creditsToAdd) || creditsToAdd <= 0) {
    return false;
  }
  
  try {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authentication session");
    
    // Get current credits for the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user credits:", userError);
      throw new Error("Failed to get user credits");
    }
    
    // Calculate new credits
    let currentCredit = 0;
    try {
      currentCredit = parseFloat(userData.credits.replace(/"/g, "")) || 0;
    } catch (e) {
      console.error("Error parsing credit:", e);
    }
    
    const newCredit = currentCredit + creditsToAdd;
    
    // Update user's credit
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredit.toString() + ".0" })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating credits:", updateError);
      throw new Error("Failed to update credits");
    }
    
    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error adding credit to user:", error);
    return false;
  }
};

// Refund operation function
export const refundOperation = async (operation: Operation): Promise<boolean> => {
  if (!operation) return false;
  
  try {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authentication session");
    
    // The refund amount from the operation
    const refundAmountStr = operation.Credit;
    const refundAmount = parseFloat(refundAmountStr || "0") || 0;
    
    // Get current credits for the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', operation.UID)
      .single();
    
    if (userError) throw new Error("Failed to get user credits");
    
    // Calculate new credits
    let currentCredit = 0;
    try {
      currentCredit = parseFloat(userData.credits.replace(/"/g, "")) || 0;
    } catch (e) {
      console.error("Error parsing credit:", e);
    }
    
    const newCredit = currentCredit + refundAmount;
    
    // Update user's credit
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredit.toString() + ".0" })
      .eq('id', operation.UID);
    
    if (updateError) throw new Error("Failed to update credits");
    
    // Update operation status and credit
    const { error: operationError } = await supabase
      .from('operations')
      .update({
        status: "Failed",
        credit: "0.0"
      })
      .eq('operation_id', operation.operation_id);
    
    if (operationError) throw new Error("Failed to update operation");
    
    return true;
  } catch (error) {
    console.error("Error refunding operation:", error);
    return false;
  }
};

export const useSharedData = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const { data: users = [], isLoading: isLoadingUsers, isSuccess: isUsersSuccess } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000, // Reduced to 1 second for more frequent updates
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes instead of an hour
    refetchOnMount: true, // Refetch data when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 1, // Only retry once on failure
    enabled: isAuthenticated, // Only run query when authenticated
    meta: {
      onSuccess: (data) => {
        // Show success toast only once after data is first loaded
        console.log("Users loaded successfully:", data.length); // Debug log
        if (!hasShownSuccessToast) {
          toast(t("fetchSuccessTitle") || "Success", {
            description: t("fetchSuccessDescription") || "Data loaded successfully"
          });
          hasShownSuccessToast = true;
        }
      }
    }
  });

  const { data: operations = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ['operations', isAdmin, user?.id],
    queryFn: () => fetchOperations(isAdmin, user?.id),
    staleTime: 1000, // Reduced stale time for more frequent updates
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: true, // Refetch data when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    enabled: isAuthenticated, // Only run query when authenticated
  });

  // Function to refresh data
  const refreshData = () => {
    if (isAuthenticated) {
      console.log("Refreshing data..."); // Debug log
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    }
  };

  return {
    users,
    operations,
    isLoading: isLoadingUsers || isLoadingOperations,
    refreshData,
    addCreditToUser,
    refundOperation,
  };
};

// Export the language hook
export { useLanguage } from './useLanguage';
