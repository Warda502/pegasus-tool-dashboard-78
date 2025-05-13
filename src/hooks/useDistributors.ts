
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './useLanguage';
import { useAuth } from './useAuth';
import type { 
  Distributor, 
  DistributorTransaction, 
  DistributorUser, 
  CreateDistributorInput, 
  UpdateDistributorInput,
  AddCreditsInput
} from './data/types/distributors';

export const useDistributors = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all distributors
  const { 
    data: distributors = [], 
    isLoading: isLoadingDistributors,
    refetch: refetchDistributors
  } = useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching distributors:', error);
        toast.error(t('fetchError'), {
          description: t('errorFetchingDistributors')
        });
        return [];
      }

      return data as Distributor[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  });

  // Fetch distributor by ID
  const fetchDistributor = async (id: string) => {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching distributor:', error);
      throw new Error(error.message);
    }

    return data as Distributor;
  };

  // Create distributor
  const createDistributorMutation = useMutation({
    mutationFn: async (input: CreateDistributorInput) => {
      setLoading(true);
      
      // First create the distributor
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          country: input.country || null,
          commission_rate: input.commission_rate || 0,
          max_credit_limit: input.max_credit_limit || 0,
          credits_balance: 0,
          created_by: user?.id
        })
        .select()
        .single();

      if (distributorError) {
        console.error('Error creating distributor:', distributorError);
        throw new Error(distributorError.message);
      }

      // If initial credits are specified, add them
      if (input.initial_credits && input.initial_credits > 0 && distributorData) {
        const { error: transactionError } = await supabase
          .from('distributor_transactions')
          .insert({
            distributor_id: distributorData.id,
            admin_id: user?.id || '',
            amount: input.initial_credits,
            previous_balance: 0,
            new_balance: input.initial_credits,
            notes: 'Initial credits allocation'
          });

        if (transactionError) {
          console.error('Error adding initial credits:', transactionError);
          // Continue despite error in adding credits
        } else {
          // Update the distributor's credit balance
          const { error: updateError } = await supabase
            .from('distributors')
            .update({ credits_balance: input.initial_credits })
            .eq('id', distributorData.id);

          if (updateError) {
            console.error('Error updating distributor credits:', updateError);
          }
        }
      }

      return distributorData as Distributor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast.success(t('distributorCreated'), {
        description: t('distributorCreatedSuccess')
      });
      setLoading(false);
    },
    onError: (error) => {
      toast.error(t('createError'), {
        description: error instanceof Error ? error.message : t('unexpectedError')
      });
      setLoading(false);
    }
  });

  // Update distributor
  const updateDistributorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateDistributorInput }) => {
      setLoading(true);
      
      const { data: updatedData, error } = await supabase
        .from('distributors')
        .update({
          ...data,
          // Prevent nullifying fields
          name: data.name !== undefined ? data.name : undefined,
          email: data.email !== undefined ? data.email : undefined,
          phone: data.phone !== undefined ? data.phone : undefined,
          country: data.country !== undefined ? data.country : undefined,
          commission_rate: data.commission_rate !== undefined ? data.commission_rate : undefined,
          max_credit_limit: data.max_credit_limit !== undefined ? data.max_credit_limit : undefined,
          status: data.status !== undefined ? data.status : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating distributor:', error);
        throw new Error(error.message);
      }

      return updatedData as Distributor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast.success(t('distributorUpdated'), {
        description: t('distributorUpdatedSuccess')
      });
      setLoading(false);
    },
    onError: (error) => {
      toast.error(t('updateError'), {
        description: error instanceof Error ? error.message : t('unexpectedError')
      });
      setLoading(false);
    }
  });

  // Add credits to distributor
  const addCreditsMutation = useMutation({
    mutationFn: async ({ 
      distributorId, 
      data 
    }: { 
      distributorId: string, 
      data: AddCreditsInput 
    }) => {
      setLoading(true);
      
      // First get current balance
      const { data: currentData, error: fetchError } = await supabase
        .from('distributors')
        .select('credits_balance')
        .eq('id', distributorId)
        .single();

      if (fetchError) {
        console.error('Error fetching distributor balance:', fetchError);
        throw new Error(fetchError.message);
      }

      const currentBalance = currentData?.credits_balance || 0;
      const newBalance = currentBalance + data.amount;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('distributor_transactions')
        .insert({
          distributor_id: distributorId,
          admin_id: user?.id || '',
          amount: data.amount,
          previous_balance: currentBalance,
          new_balance: newBalance,
          notes: data.notes || 'Credit allocation'
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw new Error(transactionError.message);
      }

      // Update distributor balance
      const { data: updatedData, error: updateError } = await supabase
        .from('distributors')
        .update({ credits_balance: newBalance })
        .eq('id', distributorId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating distributor balance:', updateError);
        throw new Error(updateError.message);
      }

      return updatedData as Distributor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      queryClient.invalidateQueries({ queryKey: ['distributorTransactions'] });
      toast.success(t('creditsAdded'), {
        description: t('creditsAddedSuccess')
      });
      setLoading(false);
    },
    onError: (error) => {
      toast.error(t('addCreditsError'), {
        description: error instanceof Error ? error.message : t('unexpectedError')
      });
      setLoading(false);
    }
  });

  // Get transactions for a distributor
  const useDistributorTransactions = (distributorId?: string) => {
    return useQuery({
      queryKey: ['distributorTransactions', distributorId],
      queryFn: async () => {
        if (!distributorId) return [];
        
        const { data, error } = await supabase
          .from('distributor_transactions')
          .select('*')
          .eq('distributor_id', distributorId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          toast.error(t('fetchError'), {
            description: t('errorFetchingTransactions')
          });
          return [];
        }

        return data as DistributorTransaction[];
      },
      enabled: !!distributorId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Get users for a distributor
  const useDistributorUsers = (distributorId?: string) => {
    return useQuery({
      queryKey: ['distributorUsers', distributorId],
      queryFn: async () => {
        if (!distributorId) return [];
        
        const { data, error } = await supabase
          .from('distributor_users')
          .select(`
            id,
            distributor_id,
            user_id,
            created_at,
            users:user_id (
              name,
              email,
              credits,
              user_type
            )
          `)
          .eq('distributor_id', distributorId);

        if (error) {
          console.error('Error fetching distributor users:', error);
          toast.error(t('fetchError'), {
            description: t('errorFetchingUsers')
          });
          return [];
        }

        return data.map(item => ({
          ...item,
          user: item.users
        })) as DistributorUser[];
      },
      enabled: !!distributorId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Add user to distributor
  const addUserToDistributorMutation = useMutation({
    mutationFn: async ({ 
      distributorId, 
      userId 
    }: { 
      distributorId: string, 
      userId: string 
    }) => {
      setLoading(true);
      
      // Check if the association already exists
      const { data: existingData, error: checkError } = await supabase
        .from('distributor_users')
        .select('id')
        .eq('distributor_id', distributorId)
        .eq('user_id', userId);

      if (checkError) {
        console.error('Error checking user association:', checkError);
        throw new Error(checkError.message);
      }

      if (existingData && existingData.length > 0) {
        throw new Error('User is already assigned to this distributor');
      }

      // Create the association
      const { error } = await supabase
        .from('distributor_users')
        .insert({
          distributor_id: distributorId,
          user_id: userId
        });

      if (error) {
        console.error('Error adding user to distributor:', error);
        throw new Error(error.message);
      }

      // Update user's distributor_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ distributor_id: distributorId })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user distributor_id:', updateError);
        // Continue despite error
      }

      return { distributorId, userId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['distributorUsers', variables.distributorId] });
      toast.success(t('userAdded'), {
        description: t('userAddedToDistributor')
      });
      setLoading(false);
    },
    onError: (error) => {
      toast.error(t('addUserError'), {
        description: error instanceof Error ? error.message : t('unexpectedError')
      });
      setLoading(false);
    }
  });

  // Remove user from distributor
  const removeUserFromDistributorMutation = useMutation({
    mutationFn: async ({ 
      distributorId, 
      userId 
    }: { 
      distributorId: string, 
      userId: string 
    }) => {
      setLoading(true);
      
      // Delete the association
      const { error } = await supabase
        .from('distributor_users')
        .delete()
        .eq('distributor_id', distributorId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing user from distributor:', error);
        throw new Error(error.message);
      }

      // Update user's distributor_id to null
      const { error: updateError } = await supabase
        .from('users')
        .update({ distributor_id: null })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user distributor_id:', updateError);
        // Continue despite error
      }

      return { distributorId, userId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['distributorUsers', variables.distributorId] });
      toast.success(t('userRemoved'), {
        description: t('userRemovedFromDistributor')
      });
      setLoading(false);
    },
    onError: (error) => {
      toast.error(t('removeUserError'), {
        description: error instanceof Error ? error.message : t('unexpectedError')
      });
      setLoading(false);
    }
  });

  return {
    // Data
    distributors,
    isLoadingDistributors,
    loading,
    
    // Methods
    fetchDistributor,
    refetchDistributors,
    createDistributor: createDistributorMutation.mutate,
    updateDistributor: updateDistributorMutation.mutate,
    addCredits: addCreditsMutation.mutate,
    useDistributorTransactions,
    useDistributorUsers,
    addUserToDistributor: addUserToDistributorMutation.mutate,
    removeUserFromDistributor: removeUserFromDistributorMutation.mutate
  };
};
