
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "./useLanguage";
import { User } from "./useSharedData";
import { useAuth } from "@/hooks/auth/AuthContext";

export const useDistributorOperations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { user, isAuthenticated, isDistributor } = useAuth();

  // Fetch distributor ID from database
  const getDistributorId = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select('id')
        .eq('uid', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching distributor ID:", error);
        return null;
      }
      
      return data?.id || null;
    } catch (err) {
      console.error("Error in getDistributorId:", err);
      return null;
    }
  };

  // Add credits to a user
  const addUserCredits = async (userId: string, amount: number) => {
    if (!isAuthenticated || !isDistributor) {
      toast.error(t("unauthorized") || "Unauthorized", {
        description: t("notAuthorized") || "You are not authorized to perform this action"
      });
      return false;
    }
    
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        toast.error(t("error") || "Error", {
          description: t("distributorNotFound") || "Distributor information not found"
        });
        return false;
      }
      
      // Get distributor's current balance
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', distributorId)
        .single();
        
      if (distributorError) {
        console.error("Error fetching distributor balance:", distributorError);
        toast.error(t("error") || "Error", {
          description: t("balanceCheckFailed") || "Failed to check your balance"
        });
        return false;
      }
      
      // Check if distributor has enough credits
      if (distributorData.current_balance < amount) {
        toast.error(t("insufficientCredits") || "Insufficient Credits", {
          description: t("notEnoughCredits") || "You don't have enough credits to perform this action"
        });
        return false;
      }
      
      // Start a transaction to update both user and distributor credits
      const { error: rpcError } = await supabase.rpc('update_distributor_balance', {
        distributor_id: distributorId,
        amount: -amount // Deduct from distributor
      });
      
      if (rpcError) {
        console.error("Error updating distributor balance:", rpcError);
        toast.error(t("error") || "Error", {
          description: t("transactionFailed") || "Transaction failed"
        });
        return false;
      }
      
      // Get current user credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user credits:", userError);
        
        // Revert distributor balance change
        await supabase.rpc('update_distributor_balance', {
          distributor_id: distributorId,
          amount: amount // Add back to distributor
        });
        
        toast.error(t("error") || "Error", {
          description: t("userNotFound") || "User not found"
        });
        return false;
      }
      
      // Calculate new credits
      let currentCredits = 0;
      try {
        currentCredits = parseFloat(userData.credits.toString().replace(/"/g, '')) || 0;
      } catch (e) {
        console.error("Error parsing credits:", e);
      }
      
      const newCredits = currentCredits + amount;
      
      // Update user credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits.toString() + ".0" })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating user credits:", updateError);
        
        // Revert distributor balance change
        await supabase.rpc('update_distributor_balance', {
          distributor_id: distributorId,
          amount: amount // Add back to distributor
        });
        
        toast.error(t("error") || "Error", {
          description: t("creditUpdateFailed") || "Failed to update user credits"
        });
        return false;
      }
      
      // Record the transaction in distributor_credits
      await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: distributorId,
          target_user_id: userId,
          amount: -amount,
          operation_type: 'credit_transfer',
          description: `Credits transferred to user`
        });
      
      // Record the transaction in server_history
      await supabase
        .from('server_history')
        .insert({
          distributor_id: distributorId,
          target_user_id: userId,
          amount: amount,
          operation_type: 'add_credits',
          status: 'completed',
          operation_details: { credits_added: amount }
        });
      
      toast.success(t("success") || "Success", {
        description: t("creditsAdded") || "Credits added successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error in addUserCredits:", error);
      toast.error(t("error") || "Error", {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
      return false;
    }
  };

  // Renew a user's subscription
  const renewUserSubscription = async (userId: string, months: number) => {
    if (!isAuthenticated || !isDistributor) {
      toast.error(t("unauthorized") || "Unauthorized", {
        description: t("notAuthorized") || "You are not authorized to perform this action"
      });
      return false;
    }
    
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        toast.error(t("error") || "Error", {
          description: t("distributorNotFound") || "Distributor information not found"
        });
        return false;
      }
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('expiry_time')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user data:", userError);
        toast.error(t("error") || "Error", {
          description: t("userNotFound") || "User not found"
        });
        return false;
      }
      
      // Calculate the new expiry date
      let newExpiryDate;
      const currentDate = new Date();
      
      if (userData.expiry_time) {
        // If there's an existing expiry date, check if it's in the future
        const currentExpiryDate = new Date(userData.expiry_time);
        if (currentExpiryDate > currentDate) {
          // If the current expiry date is in the future, add the months to it
          currentExpiryDate.setMonth(currentExpiryDate.getMonth() + months);
          newExpiryDate = currentExpiryDate.toISOString().split('T')[0];
        } else {
          // If the current expiry date is in the past, add months to today
          currentDate.setMonth(currentDate.getMonth() + months);
          newExpiryDate = currentDate.toISOString().split('T')[0];
        }
      } else {
        // If there's no expiry date, add months to today
        currentDate.setMonth(currentDate.getMonth() + months);
        newExpiryDate = currentDate.toISOString().split('T')[0];
      }
      
      // Update user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          user_type: "Monthly License",
          expiry_time: newExpiryDate
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating user subscription:", updateError);
        toast.error(t("error") || "Error", {
          description: t("renewalFailed") || "Failed to renew subscription"
        });
        return false;
      }
      
      // Record the transaction in server_history
      await supabase
        .from('server_history')
        .insert({
          distributor_id: distributorId,
          target_user_id: userId,
          operation_type: 'renew_subscription',
          status: 'completed',
          operation_details: { months_added: months, new_expiry: newExpiryDate }
        });
      
      toast.success(t("success") || "Success", {
        description: t("subscriptionRenewed") || "Subscription renewed successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error in renewUserSubscription:", error);
      toast.error(t("error") || "Error", {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
      return false;
    }
  };

  // Add a new user as a distributor
  const addUser = async (newUser: any) => {
    if (!isAuthenticated || !isDistributor) {
      toast.error(t("unauthorized") || "Unauthorized", {
        description: t("notAuthorized") || "You are not authorized to perform this action"
      });
      return false;
    }
    
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        toast.error(t("error") || "Error", {
          description: t("distributorNotFound") || "Distributor information not found"
        });
        return false;
      }
      
      console.log("Attempting to create new user:", newUser.Email);
      
      // First, create the auth user - with emailConfirm set to false
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.Email,
        password: newUser.Password,
        email_confirm: true, // This automatically confirms the email so verification is not needed
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
        uid: userId, // Use the same ID for uid field
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
        distributor_id: distributorId // Assign the user to this distributor
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
      
      // Record the action in server_history
      await supabase
        .from('server_history')
        .insert({
          distributor_id: distributorId,
          target_user_id: userId,
          operation_type: 'create_user',
          status: 'completed',
          operation_details: { user_email: newUser.Email }
        });
      
      toast.success(t("addSuccess") || "Success", {
        description: t("userAdded") || "User added successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(t("error") || "Error", {
        description: error instanceof Error ? error.message : "Failed to add user"
      });
      return false;
    }
  };

  // Update a user's information
  const updateUser = async (updatedUser: User) => {
    if (!isAuthenticated || !isDistributor) {
      toast.error(t("unauthorized") || "Unauthorized", {
        description: t("notAuthorized") || "You are not authorized to perform this action"
      });
      return false;
    }
    
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        toast.error(t("error") || "Error", {
          description: t("distributorNotFound") || "Distributor information not found"
        });
        return false;
      }
      
      // Check if user belongs to this distributor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('distributor_id')
        .eq('id', updatedUser.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user data:", userError);
        toast.error(t("error") || "Error", {
          description: t("userNotFound") || "User not found"
        });
        return false;
      }
      
      if (userData.distributor_id !== distributorId) {
        toast.error(t("unauthorized") || "Unauthorized", {
          description: t("userNotBelongToDistributor") || "This user does not belong to you"
        });
        return false;
      }
      
      // Update the user
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.Name,
          email: updatedUser.Email,
          password: updatedUser.Password,
          phone: updatedUser.Phone,
          country: updatedUser.Country,
          activate: updatedUser.Activate,
          block: updatedUser.Block,
        })
        .eq('id', updatedUser.id);

      if (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
      }

      // Record the action in server_history
      await supabase
        .from('server_history')
        .insert({
          distributor_id: distributorId,
          target_user_id: updatedUser.id,
          operation_type: 'update_user',
          status: 'completed',
          operation_details: { user_email: updatedUser.Email }
        });
      
      toast.success(t("updateSuccess") || "Success", {
        description: t("userUpdated") || "User updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(t("error") || "Error", {
        description: error instanceof Error ? error.message : "Failed to update user"
      });
      return false;
    }
  };

  // Delete a user
  const deleteUser = async (userId: string) => {
    if (!isAuthenticated || !isDistributor) {
      toast.error(t("unauthorized") || "Unauthorized", {
        description: t("notAuthorized") || "You are not authorized to perform this action"
      });
      return false;
    }
    
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        toast.error(t("error") || "Error", {
          description: t("distributorNotFound") || "Distributor information not found"
        });
        return false;
      }
      
      // Check if user belongs to this distributor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('distributor_id, email')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user data:", userError);
        toast.error(t("error") || "Error", {
          description: t("userNotFound") || "User not found"
        });
        return false;
      }
      
      if (userData.distributor_id !== distributorId) {
        toast.error(t("unauthorized") || "Unauthorized", {
          description: t("userNotBelongToDistributor") || "This user does not belong to you"
        });
        return false;
      }
      
      // Delete the user from the users table first
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (dbError) {
        console.error("Failed to delete user from database:", dbError);
        throw new Error(`Failed to delete user from database: ${dbError.message}`);
      }
      
      console.log("Successfully deleted user from database");
      
      // Use the RPC function to delete the user from auth system
      const { error: authError } = await supabase
        .rpc('delete_auth_user', { user_id: userId });
      
      if (authError) {
        console.error("Failed to delete user from auth system:", authError);
        console.warn("User was removed from the database but may remain in the auth system");
      } else {
        console.log("Successfully deleted user from auth system");
      }
      
      // Record the action in server_history
      await supabase
        .from('server_history')
        .insert({
          distributor_id: distributorId,
          target_user_id: userId,
          operation_type: 'delete_user',
          status: 'completed',
          operation_details: { user_email: userData.email }
        });
      
      toast.success(t("deleteSuccess") || "Success", {
        description: t("userDeleted") || "User deleted successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(t("error") || "Error", {
        description: error instanceof Error ? error.message : "Failed to delete user"
      });
      return false;
    }
  };

  return {
    addUserCredits,
    renewUserSubscription,
    addUser,
    updateUser,
    deleteUser,
  };
};
