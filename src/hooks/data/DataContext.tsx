
import React, { createContext, useContext, useEffect } from "react";
import { useFetchUsers } from "./useFetchUsers";
import { useFetchOperations } from "./useFetchOperations";
import { useDataActions } from "./useDataActions";
import { SharedDataContextType } from "./types";
import { useAuth } from "../auth/AuthContext";

// Create context
const DataContext = createContext<SharedDataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  const { 
    users, 
    isLoading: isLoadingUsers, 
    isError: isUsersError
  } = useFetchUsers();
  
  const { 
    operations, 
    isLoading: isLoadingOperations, 
    isError: isOperationsError 
  } = useFetchOperations();
  
  const { refreshData, addCreditToUser, refundOperation } = useDataActions();
  
  // Debug data loading
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("DataContext: User is authenticated, ID:", user.id);
      console.log("DataContext: Users data loaded:", users.length);
      
      // Check if the current user exists in the users array
      const currentUser = users.find(u => u.uid === user.id);
      if (currentUser) {
        console.log("DataContext: Current user found in users data:", currentUser);
      } else {
        console.log("DataContext: Current user NOT found in users data");
      }
      
      console.log("DataContext: Operations loaded:", operations.length);
      
      // Check operations for the current user
      const userOps = operations.filter(op => op.UID === user.id);
      console.log("DataContext: User operations count:", userOps.length);
      
      // Count refunded operations
      const refundedOps = userOps.filter(op => op.Status?.toLowerCase() === 'refunded');
      console.log("DataContext: Refunded operations:", refundedOps.length);
      console.log("DataContext: Refunded operations details:", refundedOps);
    }
  }, [isAuthenticated, user, users, operations]);
  
  // Combine all data and actions
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

// Re-export from here to maintain backward compatibility
export { formatTimeString } from "./useDataActions";
export type { User, Operation } from "./types";
