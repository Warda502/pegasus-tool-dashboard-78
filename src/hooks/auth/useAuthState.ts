
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
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);

  // Helper function to persist 2FA verification status
  const persistTwoFactorState = useCallback((verified: boolean) => {
    if (verified) {
      // Store 2FA verification in localStorage
      localStorage.setItem('2fa_verified', 'true');
    } else {
      localStorage.removeItem('2fa_verified');
    }
  }, []);

  // Check if 2FA was previously verified
  const checkStoredTwoFactorState = useCallback(() => {
    const storedVerified = localStorage.getItem('2fa_verified') === 'true';
    if (storedVerified) {
      setTwoFactorVerified(true);
    }
    return storedVerified;
  }, []);

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
        const hasTwoFactorEnabled = userDataById.two_factor_enabled || false;
        setNeedsTwoFactor(hasTwoFactorEnabled);
        
        // If 2FA is enabled, check if it was previously verified
        const storedVerified = checkStoredTwoFactorState();
        
        if (hasTwoFactorEnabled) {
          if (!storedVerified) {
            setTwoFactorVerified(false);
            console.log("2FA required but not yet verified");
          } else {
            setTwoFactorVerified(true);
            console.log("2FA required and previously verified");
          }
        } else {
          setTwoFactorVerified(true); // No 2FA needed, so it's "verified" by default
          console.log("No 2FA required, marking as verified by default");
        }
        
        return {
          id: userDataById.id,
          email: userDataById.email,
          name: userDataById.name || '',
          role: userRole,
          credits: userDataById.credits,
          expiryTime: userDataById.expiry_time,
          uid: userDataById.uid,
          twoFactorEnabled: hasTwoFactorEnabled
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
      const hasTwoFactorEnabled = userDataByUid.two_factor_enabled || false;
      setNeedsTwoFactor(hasTwoFactorEnabled);
      
      // If 2FA is enabled, check if it was previously verified
      const storedVerified = checkStoredTwoFactorState();
      
      if (hasTwoFactorEnabled) {
        if (!storedVerified) {
          setTwoFactorVerified(false);
          console.log("2FA required but not yet verified");
        } else {
          setTwoFactorVerified(true);
          console.log("2FA required and previously verified");
        }
      } else {
        setTwoFactorVerified(true); // No 2FA needed, so it's "verified" by default
        console.log("No 2FA required, marking as verified by default");
      }
      
      return {
        id: userDataByUid.id,
        email: userDataByUid.email,
        name: userDataByUid.name || '',
        role: userRole,
        credits: userDataByUid.credits,
        expiryTime: userDataByUid.expiry_time,
        uid: userDataByUid.uid,
        twoFactorEnabled: hasTwoFactorEnabled
      };
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  }, [checkStoredTwoFactorState]);

  const handleSession = useCallback(async (session: Session | null) => {
    if (!session) {
      console.log("No active session");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setNeedsTwoFactor(false);
      setTwoFactorVerified(false);
      persistTwoFactorState(false); // Clear 2FA verification status
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    
    // Important: Initially we don't know if 2FA is needed, so do NOT set isAuthenticated yet
    // We'll set it after checking user data and 2FA requirements
    
    // Fetch user data with a small delay to ensure DB is ready
    setTimeout(async () => {
      const userData = await fetchUserData(session.user.id);
      if (userData) {
        console.log("Setting user data:", userData, "2FA needed:", userData.twoFactorEnabled);
        setUser(userData as AuthUser);
        setRole(userData.role as UserRole);
        
        // CRITICAL FIX: Only set isAuthenticated to true if either:
        // 1. 2FA is not enabled, or
        // 2. 2FA is enabled AND it has been verified
        const requiresTwoFactor = userData.twoFactorEnabled || false;
        const isVerified = requiresTwoFactor ? twoFactorVerified || checkStoredTwoFactorState() : true;
        
        setIsAuthenticated(!requiresTwoFactor || isVerified);
        console.log("Authentication state set:", {
          isAuthenticated: !requiresTwoFactor || isVerified,
          needsTwoFactor: requiresTwoFactor,
          twoFactorVerified: isVerified
        });
      } else {
        console.error("Failed to fetch user data after login");
        setIsAuthenticated(false);
      }
    }, 500);
  }, [fetchUserData, twoFactorVerified, persistTwoFactorState, checkStoredTwoFactorState]);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    console.log("Marking 2FA as verified");
    setTwoFactorVerified(true);
    setIsAuthenticated(true);
    persistTwoFactorState(true); // Store the verification status
  }, [persistTwoFactorState]);

  // Handle logout - clear 2FA verification
  const clearTwoFactorState = useCallback(() => {
    console.log("Clearing 2FA verification state");
    setTwoFactorVerified(false);
    persistTwoFactorState(false);
  }, [persistTwoFactorState]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuthListener = async () => {
      try {
        console.log("Setting up auth listener");
        setLoading(true);
        
        // Check if 2FA was previously verified
        checkStoredTwoFactorState();
        
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
                setTwoFactorVerified(false);
                persistTwoFactorState(false); // Clear 2FA verification on logout
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
  }, [handleSession, checkStoredTwoFactorState, persistTwoFactorState]);

  // Sync isAuthenticated whenever 2FA status changes
  useEffect(() => {
    if (user) {
      const isFullyAuthenticated = !needsTwoFactor || twoFactorVerified;
      console.log("Updating authentication state based on 2FA:", {
        needsTwoFactor,
        twoFactorVerified,
        isFullyAuthenticated
      });
      setIsAuthenticated(isFullyAuthenticated);
    }
  }, [needsTwoFactor, twoFactorVerified, user]);

  return {
    loading,
    role,
    user,
    isAuthenticated,
    isAdmin: role === 'admin',
    sessionChecked,
    needsTwoFactor,
    twoFactorVerified,
    setTwoFactorComplete,
    clearTwoFactorState
  };
};
