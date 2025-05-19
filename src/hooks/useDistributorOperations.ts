
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useDistributorOperations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getDistributorId = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_distributor_id');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting distributor ID:", error);
      return null;
    }
  };

  const getDistributorUsers = async () => {
    setLoading(true);
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        throw new Error("No distributor ID found");
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributorId);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching distributor users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addUserCredits = async (userId: string, amount: number) => {
    setLoading(true);
    try {
      const distributorId = await getDistributorId();
      if (!distributorId) {
        throw new Error("No distributor ID found");
      }

      // Get distributor balance
      const { data: distributor, error: distributorError } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', distributorId)
        .single();
        
      if (distributorError) throw distributorError;
      
      if ((distributor.current_balance || 0) < amount) {
        throw new Error("Insufficient balance");
      }

      // Get user current credits
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Update user credits
      const currentCredits = parseFloat(user.credits || "0");
      const newCredits = currentCredits + amount;
      
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ credits: newCredits.toString() })
        .eq('id', userId);
        
      if (updateUserError) throw updateUserError;
      
      // Update distributor balance
      const newBalance = distributor.current_balance - amount;
      
      const { error: updateDistributorError } = await supabase
        .from('distributors')
        .update({ current_balance: newBalance })
        .eq('id', distributorId);
        
      if (updateDistributorError) throw updateDistributorError;
      
      // Log transaction
      await supabase
        .from('distributor_credits')
        .insert([{
          distributor_id: distributorId,
          amount: -amount,
          operation_type: 'assign',
          description: `Credits added to user ID ${userId}`
        }]);
      
      toast({
        title: "Success",
        description: `${amount} credits added to user`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add credits",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getDistributorUsers,
    addUserCredits,
    getDistributorId
  };
};
