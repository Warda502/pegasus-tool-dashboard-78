
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "../useLanguage";
import { User } from "./types";
import { useAuth } from "../auth/AuthContext";

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
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      
      toast(t("deleteSuccess"), {
        description: t("deleteUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast("Error", {
        description: "Failed to delete user"
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
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.Email,
        password: newUser.Password
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
      
      const { error: userError } = await supabase.from('users').insert({
        id: userId,
        uid: userId,
        email: newUser.Email,
        password: newUser.Password,
        name: newUser.Name || '',
        phone: newUser.Phone || '',
        country: newUser.Country,
        activate: 'Activate',
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
      
      // If the user already has an expiry date and it's in the future, use that as the starting point
      if (user.Expiry_Time) {
        const currentExpiryDate = new Date(user.Expiry_Time);
        if (currentExpiryDate > expiryDate) {
          expiryDate.setTime(currentExpiryDate.getTime());
        }
      }
      
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

  const addPlanToUser = async (userId: string, planName: string, durationMonths: number = 1) => {
    if (!isAuthenticated) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
      console.log(`Adding plan ${planName} with duration ${durationMonths} months to user ${userId}`);
      
      // Get the current user data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('my_plans, expiry_time')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching user data:", fetchError);
        throw new Error("Failed to fetch user data");
      }
      
      // Calculate new expiry date
      let expiryDate = new Date();
      
      // If the user already has an expiry date and it's in the future, use that as the starting point
      if (userData.expiry_time) {
        const currentExpiryDate = new Date(userData.expiry_time);
        if (currentExpiryDate > expiryDate) {
          expiryDate.setTime(currentExpiryDate.getTime());
        }
      }
      
      // Add the plan months to the expiry date
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      const newExpiryDate = expiryDate.toISOString().split('T')[0];
      
      // Update the user's plan
      let updatedPlans = planName;
      
      // If user already has plans, append the new one
      if (userData.my_plans) {
        const currentPlans = userData.my_plans.split(',').map(p => p.trim());
        if (!currentPlans.includes(planName)) {
          currentPlans.push(planName);
          updatedPlans = currentPlans.join(', ');
        } else {
          // Plan already assigned, update the expiry date anyway
          updatedPlans = userData.my_plans;
        }
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          my_plans: updatedPlans,
          user_type: "Monthly License",
          expiry_time: newExpiryDate
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user plan:", updateError);
        throw new Error("Failed to add plan to user");
      }

      console.log(`Successfully added plan ${planName} to user ${userId} with new expiry date ${newExpiryDate}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (error) {
      console.error("Error adding plan to user:", error);
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
