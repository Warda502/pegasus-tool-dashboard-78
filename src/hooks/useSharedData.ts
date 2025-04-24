
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLanguage } from "./useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define types based on Supabase database schema
type UserRow = Database['public']['Tables']['users']['Row'];
type OperationRow = Database['public']['Tables']['operations']['Row'];

// Extended User interface to match the structure used in the app
export interface User extends UserRow {
  Name?: string;
  Email?: string;
  Password?: string;
  Phone?: string;
  Country?: string;
  Activate?: string;
  Block?: string;
  Credits?: string;
  User_Type?: string;
  Email_Type?: string;
  Expiry_Time?: string;
  Start_Date?: string;
  Hwid?: string;
  UID?: string;
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
  LogOpration?: string;
  [key: string]: any;
}

// Variable to track if the success toast has been shown
let hasShownSuccessToast = false;

const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("No authentication token");
  
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw new Error("Failed to fetch users");
  
  // Map Supabase data to the structure expected by the app
  return data.map(user => ({
    ...user,
    Name: user.name,
    Email: user.email,
    Password: user.password,
    Phone: user.phone,
    Country: user.country,
    Activate: user.activate,
    Block: user.block,
    Credits: user.credits,
    User_Type: user.user_type,
    Email_Type: user.email_type,
    Expiry_Time: user.expiry_time,
    Start_Date: user.start_date,
    Hwid: user.hwid,
    UID: user.uid
  }));
};

const fetchOperations = async (): Promise<Operation[]> => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("No authentication token");
  
  const { data, error } = await supabase
    .from('operations')
    .select('*');
  
  if (error) throw new Error("Failed to fetch operations");

  // Map Supabase data to the structure expected by the app
  return data.map(op => ({
    ...op,
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
    LogOpration: op.log_operation
  }));
};

// إضافة الرصيد للمستخدم
const addCreditToUser = async (userId: string, amount: number): Promise<boolean> => {
  const token = localStorage.getItem("userToken");
  if (!token) return false;
  
  try {
    // احصل على الرصيد الحالي
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) return false;

    // احسب الرصيد الجديد
    const currentCredits = parseFloat(userData.credits || "0.0");
    const newCredits = (currentCredits + amount).toString() + ".0";

    // قم بتحديث الرصيد
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) return false;
    return true;
  } catch (error) {
    console.error("Error adding credits:", error);
    return false;
  }
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

// Refund operation function - adapted for Supabase
export const refundOperation = async (operation: Operation): Promise<boolean> => {
  if (!operation) return false;
  
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("No authentication token");
  
  try {
    // Set auth token
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });
    
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

  const { data: users = [], isLoading: isLoadingUsers, isSuccess: isUsersSuccess } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: 1000 * 60 * 60, // Cache for 1 hour
    meta: {
      onSuccess: () => {
        // Show success toast only once after data is first loaded
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
    queryKey: ['operations'],
    queryFn: fetchOperations,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });

  // Function to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['operations'] });
  };

  // Add credit to user with the "0." format (corrected format)
  const addCreditToUser2 = async (userId: string, amount: number): Promise<boolean> => {
    const token = localStorage.getItem("userToken");
    if (!token) return false;
    
    try {
      // Set auth token
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      });
      
      // Find the user in the already loaded data
      const user = users.find(u => u.id === userId);
      if (!user) return false;
      
      // Calculate new credits with the "0." format
      const currentCredits = parseFloat(user.credits) || 0;
      const newCredits = currentCredits + amount;
      const formattedCredits = `${newCredits}.0`;
      
      // Update credits in Supabase
      const { error } = await supabase
        .from('users')
        .update({ credits: formattedCredits })
        .eq('id', userId);

      if (error) throw new Error("Failed to add credits");
      
      // Refresh users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
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
