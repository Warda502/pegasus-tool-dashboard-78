
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
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
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
        
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setRole(null);
          setUser(null);
          navigate('/login');
        } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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

    checkAuth();
    
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
      
      toast(t("loginSuccess") || "Login successful", {
        description: t("welcomeBack") || "Welcome back!"
      });
      
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast(t("loginFailed") || "Login failed", {
        description: error instanceof Error ? error.message : "Invalid credentials"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast(t("logoutSuccess") || "Logout successful", {
        description: t("comeBackSoon") || "See you soon!"
      });
      
      navigate('/login');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast(t("logoutFailed") || "Logout failed", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      return false;
    }
  };

  const isAdmin = role === 'admin';
  const isAuthenticated = !!user;

  return { 
    role, 
    loading, 
    user,
    login,
    logout,
    isAdmin,
    isAuthenticated
  };
};
