
import React, { createContext, useContext } from "react";
import { useFetchUsers } from "./useFetchUsers";
import { useFetchOperations } from "./useFetchOperations";
import { useDataActions } from "./useDataActions";
import { SharedDataContextType } from "./types";

// Create context
const DataContext = createContext<SharedDataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { users, isLoading: isLoadingUsers, isError: isUsersError } = useFetchUsers();
  const { operations, isLoading: isLoadingOperations, isError: isOperationsError } = useFetchOperations();
  const { refreshData, addCreditToUser, refundOperation } = useDataActions();
  
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
