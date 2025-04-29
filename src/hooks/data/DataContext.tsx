
import React, { createContext, useContext, useEffect, useState } from "react";
import { useFetchUsers } from "./useFetchUsers";
import { useFetchOperations } from "./useFetchOperations";
import { useDataActions } from "./useDataActions";
import { User, Operation } from "./types"; // Import User and Operation types
import { useAuth } from "../auth/AuthContext";
import { toast } from "@/components/ui/sonner";

// Define the SharedDataContextType here since it's not exported from types.ts
interface SharedDataContextType {
  users: User[];
  operations: Operation[];
  isLoading: boolean;
  isError: boolean;
  refreshData: () => Promise<void>;
  addCreditToUser: (userId: string, amount: number) => Promise<void>;
  refundOperation: (operationId: string) => Promise<void>;
}

const DataContext = createContext<SharedDataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
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
      
      // For regular users, check if we have their data
      if (!isAdmin && user && userResults.data) {
        if (userResults.data.length === 0 && retryCount < maxRetries) {
          console.log(`DataContext: User data not found, retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => refreshData(), 1000);
        } else if (userResults.data.length === 0) {
          console.error("DataContext: Failed to find user data after max retries");
          toast.error("Error", {
            description: "Failed to load user data after multiple attempts"
          });
        } else {
          console.log("DataContext: User data found after refresh:", userResults.data[0]);
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
      
      if (users.length > 0) {
        if (isAdmin) {
          // For admin, find their user data in the full list
          const adminUser = users.find(u => u.uid === user.id || u.id === user.id || u.UID === user.id);
          if (adminUser) {
            console.log("DataContext: Admin user found in users data:", adminUser);
          } else {
            console.log("DataContext: Admin user NOT found in users data");
          }
        } else {
          // For regular user, the first item should be their data (since we're fetching only their data)
          console.log("DataContext: Regular user data:", users[0]);
        }
      } else {
        console.log("DataContext: No user data loaded yet");
        if (retryCount === 0) {
          // Only show this warning once, not on every retry
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
    }
  }, [isAuthenticated, user, users, operations, isAdmin, retryCount]);
  
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
