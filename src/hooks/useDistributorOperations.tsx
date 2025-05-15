
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";
import { User } from "./useSharedData";

export const useDistributorOperations = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isAuthenticated, isDistributor, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const fetchDistributorUsers = async () => {
    if (!isAuthenticated || !isDistributor) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return [];
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', user?.id);

      if (error) {
        throw error;
      }

      return data.map(user => {
        const creditsValue = user.credits ? user.credits.toString().replace(/"/g, '') : "0.0";
        
        return {
          ...user,
          Name: user.name || "",
          Email: user.email || "",
          Password: user.password || "",
          Phone: user.phone || "",
          Country: user.country || "",
          Activate: user.activate || "Not Activate",
          Block: user.block || "Not Blocked",
          Credits: creditsValue,
          User_Type: user.user_type || "Credits License",
          Email_Type: user.email_type || "User",
          Expiry_Time: user.expiry_time || "",
          Start_Date: user.start_date || "",
          Hwid: user.hwid || "",
          UID: user.uid || ""
        };
      });
    } catch (error) {
      console.error("Error fetching distributor users:", error);
      toast("Error", {
        description: "Failed to fetch users"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAuthenticated || !isDistributor) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("Deleting user with ID:", userId);
      
      // First, check if this user belongs to the distributor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('distributor_id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        throw new Error("Failed to verify user ownership");
      }
      
      if (userData.distributor_id !== user?.id) {
        throw new Error("You don't have permission to delete this user");
      }
      
      // Delete the user from the users table first
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (dbError) {
        throw new Error(`Failed to delete user from database: ${dbError.message}`);
      }
      
      // Use the RPC function to delete the user from auth system
      const { error: authError } = await supabase
        .rpc('delete_auth_user', { user_id: userId });
      
      if (authError) {
        console.warn("User was removed from the database but may remain in the auth system");
      }
      
      // Record this operation in server_history
      await supabase.from('server_history').insert({
        distributor_id: user?.id,
        operation_type: 'delete_user',
        operation_details: {
          user_id: userId
        },
        target_user_id: userId
      });
      
      toast(t("deleteSuccess"), {
        description: t("deleteUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['distributor_users'] });
      queryClient.invalidateQueries({ queryKey: ['server_history'] });
      return true;
    } catch (error) {
      console.error("Error during user deletion:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to delete user"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServerHistory = async () => {
    if (!isAuthenticated || !isDistributor) {
      toast(t("sessionExpired") || "انتهت الجلسة", {
        description: t("pleaseLogin") || "الرجاء تسجيل الدخول مرة أخرى"
      });
      return [];
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('server_history')
        .select('*')
        .eq('distributor_id', user?.id)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching server history:", error);
      toast("Error", {
        description: "Failed to fetch server history"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDistributorStats = async () => {
    if (!isAuthenticated || !isDistributor) {
      return {
        credits: "0",
        userCount: 0,
        operationCount: 0
      };
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const { count: userCount, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('distributor_id', user?.id);

      if (countError) throw countError;

      const { count: opCount, error: opError } = await supabase
        .from('server_history')
        .select('id', { count: 'exact', head: true })
        .eq('distributor_id', user?.id);

      if (opError) throw opError;

      return {
        credits: userData.credits || "0",
        userCount: userCount || 0,
        operationCount: opCount || 0
      };
    } catch (error) {
      console.error("Error fetching distributor stats:", error);
      return {
        credits: "0",
        userCount: 0,
        operationCount: 0
      };
    }
  };

  return {
    fetchDistributorUsers,
    deleteUser,
    fetchServerHistory,
    getDistributorStats,
    isLoading
  };
};
