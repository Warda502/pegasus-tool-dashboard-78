
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
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [twoFactorVerified, setTwoFactorVerified] = useState(true); // Default to true for non-2FA users

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log("Fetching complete user data for ID:", userId);
      
      // Try first with ID
      const { data: userDataById, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user data by ID:", error);
      }

      // If found by ID, use it
      if (userDataById) {
        console.log("User data found by ID:", userDataById);
        
        const userRole = ((userDataById.email_type || '').toLowerCase() === 'admin') 
          ? 'admin' as UserRole 
          : 'user' as UserRole;
        
        // Check if user has 2FA enabled
        if (userDataById.two_factor_enabled) {
          setNeedsTwoFactor(true);
          setTwoFactorVerified(false);
        } else {
          setNeedsTwoFactor(false);
          setTwoFactorVerified(true);
        }
        
        return {
          id: userDataById.id,
          email: userDataById.email,
          name: userDataById.name || '',
          role: userRole,
          credits: userDataById.credits,
          expiryTime: userDataById.expiry_time,
          uid: userDataById.uid,
          twoFactorEnabled: userDataById.two_factor_enabled || false
        };
      }

      // If not found by ID, try with UID
      console.log("No user data found by ID, trying with UID...");
      const { data: userDataByUid, error: uidError } = await supabase
        .from('users')
        .select('*')
        .eq('uid', userId)
        .single();
        
      if (uidError) {
        console.error("Error fetching user by UID:", uidError);
        return null;
      }
      
      if (!userDataByUid) {
        console.error("No user data found by either ID or UID");
        return null;
      }

      console.log("User data found by UID:", userDataByUid);
      
      const userRole = ((userDataByUid.email_type || '').toLowerCase() === 'admin') 
        ? 'admin' as UserRole 
        : 'user' as UserRole;
      
      // Check if user has 2FA enabled
      if (userDataByUid.two_factor_enabled) {
        setNeedsTwoFactor(true);
        setTwoFactorVerified(false);
      } else {
        setNeedsTwoFactor(false);
        setTwoFactorVerified(true);
      }
      
      return {
        id: userDataByUid.id,
        email: userDataByUid.email,
        name: userDataByUid.name || '',
        role: userRole,
        credits: userDataByUid.credits,
        expiryTime: userDataByUid.expiry_time,
        uid: userDataByUid.uid,
        twoFactorEnabled: userDataByUid.two_factor_enabled || false
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
      setNeedsTwoFactor(false);
      setTwoFactorVerified(true);
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    
    // Fetch user data with a small delay to ensure DB is ready
    setTimeout(async () => {
      const userData = await fetchUserData(session.user.id);
      if (userData) {
        console.log("Setting user data:", userData);
        setUser(userData as AuthUser);
        setRole(userData.role as UserRole);
        
        // User is authenticated if they have passed 2FA or don't need it
        setIsAuthenticated(userData.twoFactorEnabled ? twoFactorVerified : true);
      } else {
        console.error("Failed to fetch user data after login");
      }
    }, 500);
  }, [fetchUserData, twoFactorVerified]);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    console.log("Marking 2FA as verified");
    setTwoFactorVerified(true);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuthListener = async () => {
      try {
        console.log("Setting up auth listener");
        setLoading(true);
        
        // Set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session) => {
            console.log("Auth state changed:", event, "Session exists:", !!session);
            
            switch(event) {
              case 'SIGNED_OUT':
                setRole(null);
                setUser(null);
                setIsAuthenticated(false);
                setNeedsTwoFactor(false);
                setTwoFactorVerified(true);
                break;
              
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
              case 'USER_UPDATED':
              case 'INITIAL_SESSION':
                if (session) {
                  // Use setTimeout to avoid potential deadlocks with Supabase auth
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

        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
        } else {
          console.log("Initial session check:", session ? "Session exists" : "No session");
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
    sessionChecked,
    needsTwoFactor,
    twoFactorVerified,
    setTwoFactorComplete
  };
};
