
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, UserRole, AuthState } from "./types";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

export const useAuthState = (): AuthState => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('email, name, email_type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return null;
      }

      const userRole = ((userData?.email_type || '').toLowerCase() === 'admin') 
        ? 'admin' as UserRole 
        : 'user' as UserRole;
      
      return {
        id: userId,
        email: userData?.email || '',
        name: userData?.name || '',
        role: userRole
      };
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  }, []);

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
      setUser(userData as AuthUser);
      setRole(userData.role as UserRole);
    }
  }, [fetchUserData]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuthListener = async () => {
      try {
        console.log("Setting up auth listener");
        setLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session) => {
            console.log("Auth state changed:", event);
            
            switch(event) {
              case 'SIGNED_OUT':
                setRole(null);
                setUser(null);
                setIsAuthenticated(false);
                break;
              
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
              case 'USER_UPDATED':
              case 'INITIAL_SESSION':
                if (session) {
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
  }, [handleSession]);

  return {
    loading,
    role,
    user,
    isAuthenticated,
    isAdmin: role === 'admin',
    sessionChecked
  };
};
