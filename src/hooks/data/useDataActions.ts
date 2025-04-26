
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "./types";
import { useAuth } from "../auth/AuthContext";
import { format } from "date-fns";

export const useDataActions = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const refreshData = () => {
    if (isAuthenticated) {
      console.log("Refreshing data...");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    }
  };

  const addCreditToUser = async (userId: string, creditsToAdd: number): Promise<boolean> => {
    if (!userId || isNaN(creditsToAdd) || creditsToAdd <= 0) {
      return false;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authentication session");
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user credits:", userError);
        throw new Error("Failed to get user credits");
      }
      
      let currentCredit = 0;
      try {
        currentCredit = parseFloat(userData.credits.toString().replace(/"/g, "")) || 0;
      } catch (e) {
        console.error("Error parsing credit:", e);
      }
      
      const newCredit = currentCredit + creditsToAdd;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredit.toString() + ".0" })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Error updating credits:", updateError);
        throw new Error("Failed to update credits");
      }
      
      console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
      refreshData();
      return true;
    } catch (error) {
      console.error("Error adding credit to user:", error);
      return false;
    }
  };

  const refundOperation = async (operation: Operation) => {
    try {
      const creditString = operation.Credit?.toString().replace(/"/g, "") || "0";
      const creditValue = parseFloat(creditString);
      
      if (isNaN(creditValue) || creditValue <= 0) {
        console.log("Invalid credit value for refund:", operation.Credit);
        return false;
      }
      
      const userId = operation.UID;
      if (!userId) {
        console.log("No user ID found for operation:", operation.OprationID);
        return false;
      }
      
      const { error } = await supabase
        .from('operations')
        .update({
          status: 'Refunded',
          credit: '0.0'
        })
        .eq('operation_id', operation.OprationID);
  
      if (error) throw error;
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('uid', userId)
        .single();
        
      if (userError) {
        console.error("Error finding user record:", userError);
        throw new Error("Failed to find user record");
      }
      
      const refundSuccess = await addCreditToUser(userData.id, creditValue);
      if (!refundSuccess) {
        throw new Error("Failed to add credits back to user");
      }
      
      console.log(`Successfully refunded ${creditValue} credits to user ${userId}`);
      refreshData();
      return true;
    } catch (error) {
      console.error('Error refunding operation:', error);
      return false;
    }
  };

  return {
    refreshData,
    addCreditToUser,
    refundOperation
  };
};

export const formatTimeString = (timeStr: string): string => {
  if (!timeStr) return "";
  
  const normalizedTime = timeStr
    .replace("-م", "-PM")
    .replace("-ص", "-AM");
  
  try {
    const date = new Date(normalizedTime);
    return format(date, "yyyy/MM/dd hh:mm -aa");
  } catch {
    return timeStr;
  }
};
