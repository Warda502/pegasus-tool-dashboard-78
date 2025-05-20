
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "./useLanguage";
import { useAuth as useAuthContext } from "./auth/AuthContext";

export const useAuth = () => {
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Listen for cross-tab authentication events
  useEffect(() => {
    const authChannel = new BroadcastChannel('auth_state_channel');
    
    authChannel.onmessage = (event) => {
      if (event.data === 'SIGNED_OUT' && authContext.isAuthenticated) {
        console.log("Received logout event from another tab");
        
        // Clear any session data
        authContext.clearTwoFactorVerification();
        
        toast(t("loggedOutInAnotherTab") || "Logged out in another tab", {
          description: t("sessionEnded") || "Your session has ended"
        });
        
        navigate('/login?loggedOutInAnotherTab=true');
      }
    };
    
    return () => {
      authChannel.close();
    };
  }, [navigate, t, authContext.isAuthenticated, authContext.clearTwoFactorVerification]);

  return authContext;
};
