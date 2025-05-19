
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "../useLanguage";
import { useAuth } from "../auth/AuthContext";
import { User } from "./types";

export interface DistributorUser extends User {
  distributor_id?: string;
}

export const useDistributorOperations = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, isDistributor } = useAuth();
  const [loading, setLoading] = useState(false);

  // Function to get current distributor ID
  const getDistributorId = useCallback(async (): Promise<string | null> => {
    if (!isDistributor || !user) {
      console.error("Not authenticated as a distributor");
      return null;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_distributor_id');
      
      if (error) {
        console.error("Error getting distributor ID:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Failed to get distributor ID:", err);
      return null;
    }
  }, [isDistributor, user]);

  // Get users managed by this distributor
  const getDistributorUsers = useCallback(async () => {
    if (!isAuthenticated || !isDistributor) {
      return { data: [], error: "Not authenticated as distributor" };
    }

    try {
      setLoading(true);
      
      const distributorId = await getDistributorId();
      if (!distributorId) {
        return { data: [], error: "Couldn't determine distributor ID" };
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributorId);
      
      if (error) {
        console.error("Error fetching distributor users:", error);
        return { data: [], error: error.message };
      }
      
      // Map to expected format
      const formattedUsers = data.map(user => ({
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
      
      return { data: formattedUsers, error: null };
    } catch (err) {
      console.error("Error in getDistributorUsers:", err);
      return { data: [], error: String(err) };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDistributor, getDistributorId]);

  // Add a new user as a distributor
  const addUserAsDistributor = useCallback(async (newUser: any) => {
    if (!isAuthenticated || !isDistributor) {
      toast(t("notAuthorized") || "غير مصرح", {
        description: t("distributorRoleRequired") || "يجب أن تكون موزع للقيام بهذا الإجراء"
      });
      return false;
    }

    try {
      setLoading(true);
      console.log("Attempting to create new user as distributor");
      
      const distributorId = await getDistributorId();
      if (!distributorId) {
        throw new Error("Couldn't determine distributor ID");
      }
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.Email,
        password: newUser.Password,
        email_confirm: true,
        user_metadata: {
          name: newUser.Name || ''
        }
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        console.error("No user returned from auth signup");
        throw new Error("Failed to create auth user");
      }
      
      const userId = authData.user.id;
      console.log("Auth user created successfully with ID:", userId);
      
      // Then insert the user data into the users table with distributor_id
      const { error: userError } = await supabase.from('users').insert({
        id: userId,
        uid: userId,
        email: newUser.Email,
        password: newUser.Password,
        name: newUser.Name || '',
        phone: newUser.Phone || '',
        country: newUser.Country,
        activate: 'Active',
        block: newUser.Block || 'Not Blocked',
        credits: newUser.Credits || '0.0',
        user_type: newUser.User_Type,
        email_type: 'User',
        expiry_time: newUser.Expiry_Time,
        start_date: new Date().toISOString().split('T')[0],
        hwid: 'Null',
        distributor_id: distributorId
      });

      if (userError) {
        console.error("User data error:", userError);
        // If we fail to insert user data, we should attempt to delete the auth user
        try {
          await supabase.auth.admin.deleteUser(userId);
          console.log("Cleaned up auth user after failed user data insertion");
        } catch (cleanupError) {
          console.error("Failed to clean up auth user:", cleanupError);
        }
        throw new Error("Failed to add user data: " + userError.message);
      }
      
      toast(t("addSuccess") || "تمت الإضافة بنجاح", {
        description: t("addUserSuccess") || "تمت إضافة المستخدم بنجاح"
      });
      
      queryClient.invalidateQueries({ queryKey: ['distributorUsers'] });
      return true;
    } catch (error) {
      console.error("Error adding user as distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to add user"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDistributor, getDistributorId, queryClient, t]);

  // Add credits to a user as a distributor
  const addCreditsToUser = useCallback(async (userId: string, creditsToAdd: number) => {
    if (!isAuthenticated || !isDistributor) {
      toast(t("notAuthorized") || "غير مصرح", {
        description: t("distributorRoleRequired") || "يجب أن تكون موزع للقيام بهذا الإجراء"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log(`Adding ${creditsToAdd} credits to user ${userId} as distributor`);
      
      const distributorId = await getDistributorId();
      if (!distributorId) {
        throw new Error("Couldn't determine distributor ID");
      }
      
      // Verify the user belongs to this distributor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .eq('distributor_id', distributorId)
        .single();
      
      if (userError) {
        console.error("Error verifying user belongs to distributor:", userError);
        throw new Error("Could not verify user belongs to you");
      }
      
      // Now verify distributor has enough balance
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', distributorId)
        .single();
      
      if (distributorError) {
        console.error("Error fetching distributor balance:", distributorError);
        throw new Error("Could not verify distributor balance");
      }
      
      const currentBalance = parseFloat(distributorData.current_balance?.toString() || "0");
      if (currentBalance < creditsToAdd) {
        throw new Error("Insufficient balance to add credits");
      }
      
      // Parse user's current credits
      let currentCredit = 0;
      try {
        currentCredit = parseFloat(userData.credits.toString().replace(/"/g, "")) || 0;
      } catch (e) {
        console.error("Error parsing credit:", e);
      }
      
      const newCredit = currentCredit + creditsToAdd;
      
      // First update the user's credits - Fix here: ensure it's a string
      const newCreditString = `${newCredit.toFixed(1)}`; // Convert to string with one decimal place
      
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ credits: newCreditString })
        .eq('id', userId)
        .eq('distributor_id', distributorId);
      
      if (updateUserError) {
        console.error("Error updating user credits:", updateUserError);
        throw new Error("Failed to update user credits");
      }
      
      // Then deduct from distributor's balance
      const newBalance = currentBalance - creditsToAdd;
      const { error: updateDistributorError } = await supabase
        .from('distributors')
        .update({ current_balance: newBalance })
        .eq('id', distributorId);
      
      if (updateDistributorError) {
        console.error("Error updating distributor balance:", updateDistributorError);
        // Try to rollback user credits update
        try {
          await supabase
            .from('users')
            .update({ credits: currentCredit.toString() })
            .eq('id', userId);
        } catch (rollbackError) {
          console.error("Failed to rollback user credit update:", rollbackError);
        }
        throw new Error("Failed to update distributor balance");
      }
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: distributorId,
          amount: creditsToAdd,
          operation_type: 'subtract',
          description: `Credits added to user ${userId}`
        });
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        // This is non-critical, so just log it
      }
      
      toast(t("addCreditSuccess") || "تمت إضافة الرصيد بنجاح", {
        description: t("addCreditToUserSuccess") || "تمت إضافة الرصيد للمستخدم بنجاح"
      });
      
      queryClient.invalidateQueries({ queryKey: ['distributorUsers'] });
      return true;
    } catch (error) {
      console.error("Error adding credits as distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to add credits"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDistributor, getDistributorId, queryClient, t]);

  return {
    loading,
    getDistributorUsers,
    addUserAsDistributor,
    addCreditsToUser
  };
};
