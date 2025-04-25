
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "./useLanguage";

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setRole(null);
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'PASSWORD_RECOVERY')) {
          setIsAuthenticated(true);
          
          // Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            const { data: userData, error } = await supabase
              .from('users')
              .select('email_type, email')
              .eq('id', session.user.id)
              .single();

            if (error || !userData) {
              console.error("Error fetching user role on auth change:", error);
              return;
            }

            const userRole = ((userData.email_type || '').toLowerCase() === 'admin') ? 'admin' : 'user';
            setRole(userRole);
            setUser({
              id: session.user.id,
              email: userData.email || session.user.email || '',
              role: userRole
            });
          }, 0);
        }
      }
    );

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('email_type, email')
          .eq('id', session.user.id)
          .single();

        if (error || !userData) {
          console.error("Error fetching user role:", error);
          setLoading(false);
          return;
        }

        const userRole = ((userData.email_type || '').toLowerCase() === 'admin') ? 'admin' : 'user';
        setRole(userRole);
        setUser({
          id: session.user.id,
          email: userData.email || session.user.email || '',
          role: userRole
        });
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      subscription.unsubscribe();
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast(t("logoutSuccess"), {
        description: t("comeBackSoon")
      });
      
      navigate('/login');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast(t("logoutFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
      return false;
    }
  };

  return { 
    role, 
    loading, 
    user,
    login,
    logout,
    isAdmin: role === 'admin',
    isAuthenticated
  };
};
