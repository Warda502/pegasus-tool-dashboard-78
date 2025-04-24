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
        country: newUser.Country || 'Saudi Arabia',
        activate: newUser.Activate || 'Active',
        block: newUser.Block || 'Not Blocked',
        credits: newUser.Credits || '0.0',
        user_type: newUser.User_Type || 'Credits License',
        email_type: newUser.Email_Type || 'User',
        expiry_time: newUser.Expiry_Time || null,
        start_date: newUser.Start_Date || new Date().toISOString().split('T')[0],
        hwid: newUser.Hwid || 'Null'
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

  return {
    deleteUser,
    updateUser,
    addUser,
    renewUser
  };
};
