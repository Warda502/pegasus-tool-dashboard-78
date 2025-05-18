
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "./useLanguage";
import { User } from "./useSharedData";
import { useAuth } from "./useAuth";

export const useUserOperations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const deleteUser = async (userId: string) => {
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
      console.log("Deleting user with ID:", userId);
      
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
      
      toast(t("deleteSuccess"), {
        description: t("deleteUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error during user deletion:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to delete user"
      });
      return false;
    }
  };

  const updateUser = async (updatedUser: User) => {
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
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
        throw new Error("Failed to update user");
      }

      toast(t("updateSuccess"), {
        description: t("updateUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast("Error", {
        description: "Failed to update user data"
      });
      return false;
    }
  };

  const addUser = async (newUser: any) => {
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
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
      
      // Then insert the user data into the users table
      // IMPORTANT: We use the same ID that was created in the auth table
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
        hwid: 'Null'
      });

      if (userError) {
        console.error("User data error:", userError);
        // If we fail to insert user data, we should attempt to delete the auth user
        // to maintain database consistency
        try {
          await supabase.auth.admin.deleteUser(userId);
          console.log("Cleaned up auth user after failed user data insertion");
        } catch (cleanupError) {
          console.error("Failed to clean up auth user:", cleanupError);
        }
        throw new Error("Failed to add user data: " + userError.message);
      }
      
      console.log("User data added successfully");
      
      toast(t("addSuccess"), {
        description: t("addUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      toast(t("error") || "Error", {
        description: error instanceof Error ? error.message : "Failed to add user"
      });
      return false;
    }
  };

  const renewUser = async (user: User, months: string) => {
    if (!user) return false;
    
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));
      const newExpiryDate = expiryDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('users')
        .update({
          user_type: "Monthly License",
          expiry_time: newExpiryDate
        })
        .eq('id', user.id);

      if (error) {
        throw new Error("Failed to renew user");
      }

      toast(t("renewSuccess"), {
        description: t("renewUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error renewing user:", error);
      toast("Error", {
        description: "Failed to renew user account"
      });
      return false;
    }
  };

  const addPlanToUser = async (userId: string, planName: string, duration: number) => {
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
      console.log(`Adding plan ${planName} to user ${userId} for ${duration} months`);
      
      // Get the user's current information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('expiry_time, my_plans')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw new Error("Failed to fetch user data");
      }
      
      // Calculate the new expiry date
      let newExpiryDate;
      const currentDate = new Date();
      
      if (userData.expiry_time) {
        // If there's an existing expiry date, check if it's in the future
        const currentExpiryDate = new Date(userData.expiry_time);
        if (currentExpiryDate > currentDate) {
          // If the current expiry date is in the future, add the months to it
          currentExpiryDate.setMonth(currentExpiryDate.getMonth() + duration);
          newExpiryDate = currentExpiryDate.toISOString().split('T')[0];
        } else {
          // If the current expiry date is in the past, add months to today
          currentDate.setMonth(currentDate.getMonth() + duration);
          newExpiryDate = currentDate.toISOString().split('T')[0];
        }
      } else {
        // If there's no expiry date, add months to today
        currentDate.setMonth(currentDate.getMonth() + duration);
        newExpiryDate = currentDate.toISOString().split('T')[0];
      }
      
      // Add the new plan to the user's plans (if my_plans exists)
      let updatedPlans = userData.my_plans ? userData.my_plans : '';
      if (updatedPlans) {
        updatedPlans += `, ${planName}`;
      } else {
        updatedPlans = planName;
      }
      
      // Update the user with the new expiry date and plan
      const { error: updateError } = await supabase
        .from('users')
        .update({
          user_type: "Monthly License",
          expiry_time: newExpiryDate,
          my_plans: updatedPlans
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Error updating user with plan:", updateError);
        throw new Error("Failed to add plan to user");
      }
      
      toast(t("addPlanSuccess") || "Plan Added", {
        description: t("addPlanDescription") || "Plan has been successfully added to the user"
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error adding plan to user:", error);
      toast(t("error") || "Error", {
        description: error instanceof Error ? error.message : "Failed to add plan to user"
      });
      return false;
    }
  };

  return {
    deleteUser,
    updateUser,
    addUser,
    renewUser,
    addPlanToUser
  };
};
