
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
  const persistTwoFactorState = useCallback((verified: boolean, userId?: string) => {
    if (verified && userId) {
      // Store 2FA verification in localStorage with user ID to make it user-specific
      localStorage.setItem('2fa_verified_' + userId, 'true');
      console.log("Persisted 2FA state as verified for user:", userId);
    } else if (!verified) {
      // If no userId provided or verification is false, clear all 2FA verification data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('2fa_verified_')) {
          localStorage.removeItem(key);
        }
      });
      console.log("Cleared all 2FA verification states");
    }
  }, []);

  // Check if 2FA was previously verified for a specific user
  const checkStoredTwoFactorState = useCallback((userId?: string) => {
    if (!userId) return false;
    
    const storedVerified = localStorage.getItem('2fa_verified_' + userId) === 'true';
    console.log("Checking stored 2FA state for user:", userId, "Result:", storedVerified);
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
        
        // If 2FA is enabled, check if it was previously verified for this specific user
        const storedVerified = checkStoredTwoFactorState(userId);
        
        if (hasTwoFactorEnabled) {
          if (!storedVerified) {
            setTwoFactorVerified(false);
            console.log("2FA required but not yet verified for user:", userId);
            // IMPORTANT: Set isAuthenticated to false if 2FA is required but not verified
            setIsAuthenticated(false);
          } else {
            setTwoFactorVerified(true);
            setIsAuthenticated(true);
            console.log("2FA required and previously verified for user:", userId);
          }
        } else {
          setTwoFactorVerified(true); // No 2FA needed, so it's "verified" by default
          setIsAuthenticated(true);
          console.log("No 2FA required for user:", userId, "marking as verified by default");
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
      
      // If 2FA is enabled, check if it was previously verified for this specific user
      const storedVerified = checkStoredTwoFactorState(userId);
      
      if (hasTwoFactorEnabled) {
        if (!storedVerified) {
          setTwoFactorVerified(false);
          setIsAuthenticated(false); // IMPORTANT: Set isAuthenticated to false if 2FA is required but not verified
          console.log("2FA required but not yet verified for user:", userId);
        } else {
          setTwoFactorVerified(true);
          setIsAuthenticated(true);
          console.log("2FA required and previously verified for user:", userId);
        }
      } else {
        setTwoFactorVerified(true); // No 2FA needed, so it's "verified" by default
        setIsAuthenticated(true);
        console.log("No 2FA required for user:", userId, "marking as verified by default");
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
      persistTwoFactorState(false); // Clear all 2FA verification statuses
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    
    // IMPORTANT: Do NOT set isAuthenticated yet
    // Wait until we know if 2FA is required and verified
    
    // Fetch user data with a small delay to ensure DB is ready
    setTimeout(async () => {
      const userData = await fetchUserData(session.user.id);
      
      if (userData) {
        console.log("Setting user data:", userData, "2FA needed:", userData.twoFactorEnabled);
        setUser(userData as AuthUser);
        setRole(userData.role as UserRole);
        
        // CRITICAL FIX: Only set isAuthenticated to true if either:
        // 1. 2FA is not enabled, or
        // 2. 2FA is enabled AND it has been verified for this specific user
        const requiresTwoFactor = userData.twoFactorEnabled || false;
        const isVerified = requiresTwoFactor ? checkStoredTwoFactorState(userData.id) : true;
        
        // Update state based on 2FA requirements
        setNeedsTwoFactor(requiresTwoFactor);
        setTwoFactorVerified(isVerified);
        setIsAuthenticated(!requiresTwoFactor || isVerified);
        
        console.log("Authentication state set:", {
          isAuthenticated: !requiresTwoFactor || isVerified,
          needsTwoFactor: requiresTwoFactor,
          twoFactorVerified: isVerified,
          userId: userData.id
        });
      } else {
        console.error("Failed to fetch user data after login");
        setIsAuthenticated(false);
        setNeedsTwoFactor(false);
        setTwoFactorVerified(false);
      }
    }, 500);
  }, [fetchUserData, persistTwoFactorState, checkStoredTwoFactorState]);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    if (!user) {
      console.error("Cannot mark 2FA as verified: No user data available");
      return;
    }
    
    console.log("Marking 2FA as verified for user:", user.id);
    setTwoFactorVerified(true);
    setIsAuthenticated(true);
    persistTwoFactorState(true, user.id); // Store the verification status with user ID
  }, [persistTwoFactorState, user]);

  // Handle logout - clear 2FA verification
  const clearTwoFactorState = useCallback(() => {
    console.log("Clearing 2FA verification state");
    setTwoFactorVerified(false);
    persistTwoFactorState(false); // This will clear all 2FA verification states
  }, [persistTwoFactorState]);

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
                setTwoFactorVerified(false);
                persistTwoFactorState(false); // Clear all 2FA verification on logout
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
  }, [handleSession, persistTwoFactorState]);

  // Debug logging for state changes
  useEffect(() => {
    console.log("Auth state updated:", {
      isAuthenticated,
      needsTwoFactor,
      twoFactorVerified,
      hasUser: !!user
    });
  }, [isAuthenticated, needsTwoFactor, twoFactorVerified, user]);

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
