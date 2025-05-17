
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { Distributor } from "./types";
import { v4 as uuidv4 } from 'uuid';

export const useDistributorOperations = () => {
  const { t } = useLanguage();

  const addDistributor = async (formData: any) => {
    try {
      console.log("Creating new distributor with data:", formData);

      // Generate a UUID for the user
      const uid = uuidv4();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        toast(t("error") || "Error", {
          description: authError.message || t("failedToCreateDistributor") || "Failed to create distributor"
        });
        return false;
      }

      // Get the user ID from the auth user
      const userId = authData.user?.id;
      
      if (!userId) {
        console.error("No user ID returned from auth");
        toast(t("error") || "Error", {
          description: t("failedToCreateDistributor") || "Failed to create distributor"
        });
        return false;
      }

      // 2. Insert into users table
      const { error: usersError } = await supabase
        .from('users')
        .insert({
          id: userId,
          uid: uid,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          email_type: 'Distributor',
          credits: '0.0',
          user_type: 'Distributor',
          activate: 'Active',
          block: 'Not Blocked',
          start_date: new Date().toISOString().split('T')[0],
          expiry_time: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0]
        });

      if (usersError) {
        console.error("Error creating user record:", usersError);
        toast(t("error") || "Error", {
          description: usersError.message || t("failedToCreateDistributor") || "Failed to create distributor"
        });
        return false;
      }

      // 3. Insert into distributors table
      const { error: distributorError } = await supabase
        .from('distributors')
        .insert({
          uid: uid,
          commission_rate: formData.commission_rate || '0',
          website: formData.website || '',
          facebook: formData.facebook || '',
          permissions: formData.permissions || 'basic'
        });

      if (distributorError) {
        console.error("Error creating distributor record:", distributorError);
        toast(t("error") || "Error", {
          description: distributorError.message || t("failedToCreateDistributor") || "Failed to create distributor"
        });
        return false;
      }

      toast(t("success") || "Success", {
        description: t("distributorCreatedSuccess") || "Distributor created successfully"
      });
      return true;
    } catch (error: any) {
      console.error("Error in addDistributor:", error);
      toast(t("error") || "Error", {
        description: error.message || t("failedToCreateDistributor") || "Failed to create distributor"
      });
      return false;
    }
  };

  const updateDistributor = async (distributor: Partial<Distributor>) => {
    try {
      console.log("Updating distributor:", distributor);
      
      if (!distributor.id) {
        throw new Error("No distributor ID provided");
      }
      
      // Update distributor-specific fields
      const { error: distributorError } = await supabase
        .from('distributors')
        .update({
          commission_rate: distributor.commission_rate,
          website: distributor.website,
          facebook: distributor.facebook,
          permissions: distributor.permissions
        })
        .eq('id', distributor.id);
      
      if (distributorError) {
        console.error("Error updating distributor:", distributorError);
        throw new Error(distributorError.message);
      }
      
      // If user data is provided, update user record
      if (distributor.user && distributor.uid) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: distributor.user.name,
            phone: distributor.user.phone,
            country: distributor.user.country
          })
          .eq('uid', distributor.uid);
        
        if (userError) {
          console.error("Error updating user data for distributor:", userError);
          throw new Error(userError.message);
        }
      }
      
      toast(t("success") || "Success", {
        description: t("distributorUpdatedSuccess") || "Distributor updated successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in updateDistributor:", error);
      toast(t("error") || "Error", {
        description: error.message || t("failedToUpdateDistributor") || "Failed to update distributor"
      });
      return false;
    }
  };

  const deleteDistributor = async (distributorId: string, uid?: string) => {
    try {
      console.log(`Deleting distributor ${distributorId} with uid ${uid}`);
      
      // Delete the distributor record
      const { error: distributorError } = await supabase
        .from('distributors')
        .delete()
        .eq('id', distributorId);
      
      if (distributorError) {
        console.error("Error deleting distributor:", distributorError);
        throw new Error(distributorError.message);
      }
      
      // If UID is provided, delete the user record and auth user
      if (uid) {
        // First find the user ID from the users table using the UID
        const { data: userData, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('uid', uid)
          .single();
        
        if (findError) {
          console.error("Error finding user for distributor:", findError);
          throw new Error(findError.message);
        }
        
        if (userData && userData.id) {
          // Delete the user record
          const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('uid', uid);
          
          if (userError) {
            console.error("Error deleting user for distributor:", userError);
            throw new Error(userError.message);
          }
          
          // Delete the auth user
          const { error: authError } = await supabase
            .rpc('delete_auth_user', { user_id: userData.id });
          
          if (authError) {
            console.error("Error deleting auth user for distributor:", authError);
            throw new Error(authError.message);
          }
        }
      }
      
      toast(t("success") || "Success", {
        description: t("distributorDeletedSuccess") || "Distributor deleted successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in deleteDistributor:", error);
      toast(t("error") || "Error", {
        description: error.message || t("failedToDeleteDistributor") || "Failed to delete distributor"
      });
      return false;
    }
  };

  return {
    addDistributor,
    updateDistributor,
    deleteDistributor
  };
};
