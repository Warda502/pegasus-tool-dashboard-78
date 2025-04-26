
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "./useLanguage";
import { AuthChangeEvent } from "@supabase/supabase-js";

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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session) => {
            console.log("Auth state changed:", event, session ? "session active" : "no session");
            
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
                // Handle sign-in or session update events
                setIsAuthenticated(!!session);
                
                if (session?.user?.id) {
                  try {
                    const { data: userData, error } = await supabase
                      .from('users')
                      .select('email_type, email')
                      .eq('id', session.user.id)
                      .single();

                    if (error) {
                      console.error("Error fetching user role on auth change:", error);
                      return;
                    }

                    const userRole = ((userData?.email_type || '').toLowerCase() === 'admin') ? 'admin' : 'user';
                    setRole(userRole);
                    setUser({
                      id: session.user.id,
                      email: userData?.email || session.user.email || '',
                      role: userRole
                    });
                  } catch (err) {
                    console.error("Failed to fetch user data:", err);
                  }
                }
                break;
              
              default:
                console.log("Unhandled auth event:", event);
                break;
            }
          }
        );

        unsubscribe = () => {
          subscription.unsubscribe();
        };

        // التحقق من الجلسة الحالية بعد إعداد المستمع
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setLoading(false);
          setSessionChecked(true);
          return;
        }
        
        if (!session) {
          console.log("No active session found");
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        console.log("Active session found for:", session.user.email);
        
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('email_type, email')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setLoading(false);
            setSessionChecked(true);
            return;
          }

          const userRole = ((userData?.email_type || '').toLowerCase() === 'admin') ? 'admin' : 'user';
          setRole(userRole);
          setUser({
            id: session.user.id,
            email: userData?.email || session.user.email || '',
            role: userRole
          });
          setIsAuthenticated(true);
          
        } catch (error) {
          console.error("Auth error:", error);
        } finally {
          setLoading(false);
          setSessionChecked(true);
        }
      } catch (err) {
        console.error("Setup auth listener error:", err);
        setLoading(false);
        setSessionChecked(true);
      }
    };

    // إضافة تأخير صغير لضمان استقرار الحالة
    const timer = setTimeout(() => {
      setupAuthListener();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
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
    }
  };

  const logout = async () => {
    try {
      // First clear local state
      setRole(null);
      setUser(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Finally set authentication status to false
      setIsAuthenticated(false);
      
      // Navigate after a small delay
      setTimeout(() => {
        toast(t("logoutSuccess"), {
          description: t("comeBackSoon")
        });
        navigate('/login?loggedOut=true');
      }, 200);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast(t("logoutFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
      return false;
    }
  };

  // Centralized session expiration handling
  const handleSessionExpired = () => {
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
  };

  // Check session validity (can be used by ProtectedRoute or other components)
  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        handleSessionExpired();
        return false;
      }
      
      if (!data.session) {
        console.log("No active session found in checkSession");
        if (isAuthenticated) {
          handleSessionExpired();
        }
        return false;
      }
      
      // Check if session is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (data.session.expires_at && data.session.expires_at < currentTime) {
        console.log("Session expired, redirecting to login");
        handleSessionExpired();
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error in checkSession:", err);
      return false;
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
