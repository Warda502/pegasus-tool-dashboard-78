
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "./useLanguage";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useLanguage();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Centralized function to fetch user role and details
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('email_type, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      const userRole = ((userData?.email_type || '').toLowerCase() === 'admin') ? 'admin' : 'user';
      
      return {
        id: userId,
        email: userData?.email || '',
        role: userRole
      };
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  }, []);

  // Centralized session handling - updates state based on session
  const handleSession = useCallback(async (session: Session | null) => {
    if (!session) {
      console.log("No active session");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    setIsAuthenticated(true);
    
    const userData = await fetchUserData(session.user.id);
    if (userData) {
      setUser(userData);
      setRole(userData.role);
    }
  }, [fetchUserData]);
  
  // Setup auth listener once on component mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuthListener = async () => {
      try {
        console.log("Setting up auth listener");
        setLoading(true);
        
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session) => {
            console.log("Auth state changed:", event);
            
            switch(event) {
              case 'SIGNED_OUT':
              case 'USER_DELETED':
                // Handle logout events
                setRole(null);
                setUser(null);
                setIsAuthenticated(false);
                break;
              
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
              case 'USER_UPDATED':
              case 'PASSWORD_RECOVERY':
              case 'MFA_CHALLENGE_VERIFIED':
              case 'INITIAL_SESSION':
                // Don't set loading to true here, as we'll handle with setTimeout
                if (session) {
                  // Use setTimeout to avoid potential deadlock with Supabase
                  setTimeout(() => {
                    handleSession(session);
                  }, 0);
                }
                break;
            }
          }
        );

        unsubscribe = () => {
          subscription.unsubscribe();
        };

        // Then check for existing session (after listener is set up)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
        } else {
          await handleSession(session);
        }
        
      } catch (err) {
        console.error("Setup auth listener error:", err);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate, handleSession]);

  // Centralized session checking function - doesn't affect loading state
  const checkSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        return false;
      }
      
      if (!data.session) {
        console.log("No active session found in checkSession");
        return false;
      }
      
      // Check if session is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (data.session.expires_at && data.session.expires_at < currentTime) {
        console.log("Session expired");
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error in checkSession:", err);
      return false;
    }
  }, []);
  
  // Centralized session expiration handling
  const handleSessionExpired = useCallback(() => {
    console.log("Handling session expiration");
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Only show toast and redirect if not already on login page
    if (window.location.pathname !== '/login') {
      toast(t("sessionExpired") || "انتهت صلاحية الجلسة", {
        description: t("pleaseLoginAgain") || "يرجى تسجيل الدخول مجددًا"
      });
      
      navigate('/login?sessionExpired=true');
    }
  }, [navigate, t]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast(t("loginSuccess"), {
        description: t("welcomeBack")
      });
      
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast(t("loginFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state after successful sign out
      setRole(null);
      setUser(null);
      setIsAuthenticated(false);
      
      toast(t("logoutSuccess"), {
        description: t("comeBackSoon")
      });
      
      navigate('/login?loggedOut=true');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast(t("logoutFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    role, 
    loading,
    user,
    login,
    logout,
    handleSessionExpired,
    checkSession,
    isAdmin: role === 'admin',
    isAuthenticated,
    sessionChecked
  };
};
