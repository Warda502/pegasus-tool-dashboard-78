
import React, { createContext, useContext, useEffect } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType } from "./types";

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions();
  
  // Combine state and actions
  const authContext = { ...authState, ...authActions };
  
  useEffect(() => {
    // Handle cross-tab authentication sync
    const authChannel = new BroadcastChannel('auth_state_channel');
    
    authChannel.onmessage = (event) => {
      if (event.data === 'SIGNED_OUT' && authState.isAuthenticated) {
        console.log("Received logout event from another tab");
        
        setTimeout(() => {
          window.location.href = '/login?loggedOutInAnotherTab=true';
        }, 100);
      }
    };
    
    return () => {
      authChannel.close();
    };
  }, [authState.isAuthenticated]);
  
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
