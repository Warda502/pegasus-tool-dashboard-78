import React, { createContext, useContext, useEffect, useState } from "react";
import { useFetchUsers } from "./useFetchUsers";
import { useFetchOperations } from "./useFetchOperations";
import { useDataActions } from "./useDataActions";
import { SharedDataContextType } from "./types";
import { useAuth } from "../auth/AuthContext";
import { toast } from "@/components/ui/sonner";

const DataContext = createContext<SharedDataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const { 
    users, 
    isLoading: isLoadingUsers, 
    isError: isUsersError,
    refetch: refetchUsers
  } = useFetchUsers();
  
  const { 
    operations, 
    isLoading: isLoadingOperations, 
    isError: isOperationsError,
    refetch: refetchOperations
  } = useFetchOperations();
  
  const { refreshData: originalRefreshData, addCreditToUser, refundOperation } = useDataActions();
  
  const refreshData = async () => {
    console.log("DataContext: Refreshing data explicitly");
    
    try {
      const userResults = await refetchUsers();
      const opsResults = await refetchOperations();
      
      if (user && userResults.data && userResults.data.length > 0) {
        const foundUser = userResults.data.find(u => 
          u.id === user.id || u.uid === user.id || u.UID === user.id
        );
        
        if (!foundUser && retryCount < maxRetries) {
          console.log(`DataContext: User data not found, retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => refreshData(), 1000);
        } else if (!foundUser) {
          console.error("DataContext: Failed to find user data after max retries");
          console.log("DataContext: Available user IDs:", userResults.data.map(u => 
            `id:${u.id}, uid:${u.uid}, UID:${u.UID}`
          ).join('; '));
          toast.error("Error", {
            description: "Failed to load user data after multiple attempts"
          });
        } else {
          console.log("DataContext: User data found after refresh:", foundUser);
          setRetryCount(0);
        }
      }
      
      originalRefreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Error", {
        description: "Failed to refresh data"
      });
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("DataContext: Initial data load for user:", user.id);
      refreshData();
    }
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("DataContext: User is authenticated, ID:", user.id);
      console.log("DataContext: Users data loaded:", users.length);
      
      const currentUser = users.find(u => u.uid === user.id || u.id === user.id || u.UID === user.id);
      if (currentUser) {
        console.log("DataContext: Current user found in users data:", currentUser);
      } else {
        console.log("DataContext: Current user NOT found in users data");
        console.log("DataContext: Available user IDs:", users.map(u => 
          `id:${u.id}, uid:${u.uid}, UID:${u.UID}`
        ).join(', '));
        
        if (users.length > 0) {
          toast.warning("Data Warning", {
            description: "Your user profile was not found in the data. This might affect dashboard display.",
            duration: 7000
          });
        }
      }
      
      console.log("DataContext: Operations loaded:", operations.length);
      
      const userOps = operations.filter(op => op.UID === user.id);
      console.log("DataContext: User operations count:", userOps.length);
      
      const refundedOps = userOps.filter(op => op.Status?.toLowerCase() === 'refunded');
      console.log("DataContext: Refunded operations:", refundedOps.length);
      console.log("DataContext: Refunded operations details:", refundedOps);
    }
  }, [isAuthenticated, user, users, operations]);
  
  const dataContext = {
    users,
    operations,
    isLoading: isLoadingUsers || isLoadingOperations,
    isError: isUsersError || isOperationsError,
    refreshData,
    addCreditToUser,
    refundOperation
  };
  
  return (
    <DataContext.Provider value={dataContext}>
      {children}
    </DataContext.Provider>
  );
};

export const useSharedData = (): SharedDataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useSharedData must be used within a DataProvider");
  }
  return context;
};

export { formatTimeString } from "./useDataActions";
export type { User, Operation } from "./types";
