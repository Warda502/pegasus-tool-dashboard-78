
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType } from "./types";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  const authActions = useAuthActions();
  const { t } = useLanguage();
  const [initialized, setInitialized] = useState(false);
  
  // Combine state and actions
  const authContext = { ...authState, ...authActions, initialized };
  
  useEffect(() => {
    // Set initialized to true when session check is complete
    if (authState.sessionChecked && !initialized) {
      console.log("Auth context initialized");
      setInitialized(true);
    }
  }, [authState.sessionChecked, initialized]);
  
  useEffect(() => {
    // Log authentication state for debugging
    console.log("Auth context state:", {
      isAuthenticated: authState.isAuthenticated,
      needsTwoFactor: authState.needsTwoFactor,
      twoFactorVerified: authState.twoFactorVerified,
      role: authState.role,
      sessionChecked: authState.sessionChecked,
      initialized
    });
  }, [
    authState.isAuthenticated, 
    authState.needsTwoFactor, 
    authState.twoFactorVerified, 
    authState.role,
    authState.sessionChecked,
    initialized
  ]);
  
  useEffect(() => {
    // Handle cross-tab authentication sync
    const authChannel = new BroadcastChannel('auth_state_channel');
    
    authChannel.onmessage = (event) => {
      if (event.data === 'SIGNED_OUT' && authState.isAuthenticated) {
        console.log("Received logout event from another tab");
        
        // Clear any session data
        authState.clearTwoFactorVerification();
        
        // Show toast
        toast(t("loggedOutInAnotherTab") || "تم تسجيل الخروج في نافذة أخرى", {
          description: t("sessionEnded") || "انتهت جلستك"
        });
        
        // Use location directly to avoid navigation loop issues
        window.location.href = '/login?loggedOutInAnotherTab=true';
      }
    };
    
    return () => {
      authChannel.close();
    };
  }, [authState.isAuthenticated, authState.clearTwoFactorVerification, t]);
  
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
