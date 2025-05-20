
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, UserRole, AuthState } from "./types";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

// Key for storing 2FA verification state in localStorage
const TwoFactorVerifiedKey = "auth_2fa_verified";

export const useAuthState = (): AuthState => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  // Initialize from localStorage if available
  const [twoFactorVerified, setTwoFactorVerified] = useState<boolean>(() => {
    const stored = localStorage.getItem(TwoFactorVerifiedKey);
    return stored === 'true';
  });

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log("Fetching complete user data for ID:", userId);
      
      // Only check by UID - consolidated approach
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return null;
      }

      if (!userData) {
        console.error("No user data found");
        return null;
      }

      console.log("User data found:", userData);
      
      let userRole: UserRole = 'user';
      
      // Determine role based on email_type
      if ((userData.email_type || '').toLowerCase() === 'admin') {
        userRole = 'admin';
      } else if ((userData.email_type || '').toLowerCase() === 'distributor') {
        userRole = 'distributor';
      }
      
      // Check if user has 2FA enabled
      const hasTwoFactorEnabled = userData.two_factor_enabled || false;
      setNeedsTwoFactor(hasTwoFactorEnabled);
      
      // IMPORTANT: Check if 2FA has been previously verified for this user
      const isVerified = localStorage.getItem(TwoFactorVerifiedKey) === 'true';
      console.log("2FA verification status from localStorage:", isVerified);
      
      if (hasTwoFactorEnabled) {
        setTwoFactorVerified(isVerified);
      } else {
        // No 2FA needed, so it's "verified" by default
        setTwoFactorVerified(true);
        // Clean up any stored 2FA state if not needed
        localStorage.removeItem(TwoFactorVerifiedKey);
      }
      
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        role: userRole,
        credits: userData.credits,
        expiryTime: userData.expiry_time,
        uid: userData.uid,
        twoFactorEnabled: hasTwoFactorEnabled
      };
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  }, []);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    console.log("Marking 2FA as verified and storing in localStorage");
    setTwoFactorVerified(true);
    // Store 2FA verification status in localStorage to persist across page reloads
    localStorage.setItem(TwoFactorVerifiedKey, 'true');
  }, []);

  // Method to clear 2FA verification (used on logout)
  const clearTwoFactorVerification = useCallback(() => {
    console.log("Clearing 2FA verification status");
    localStorage.removeItem(TwoFactorVerifiedKey);
    setTwoFactorVerified(false);
  }, []);

  const handleSession = useCallback(async (session: Session | null) => {
    if (!session) {
      console.log("No active session - clearing auth state");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setNeedsTwoFactor(false);
      setTwoFactorVerified(false);
      // Clean up stored 2FA state on session end
      localStorage.removeItem(TwoFactorVerifiedKey);
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    
    // Important: Set default authenticated state as false until user data is fetched
    setIsAuthenticated(false);
    
    // Fetch user data with a small delay to ensure DB is ready
    const userData = await fetchUserData(session.user.id);
    if (userData) {
      console.log("Setting user data:", userData);
      setUser(userData as AuthUser);
      setRole(userData.role as UserRole);
      
      const requiresTwoFactor = userData.twoFactorEnabled || false;
      console.log("User requires 2FA:", requiresTwoFactor);
      
      // Check if 2FA is already verified from localStorage
      const isVerified = localStorage.getItem(TwoFactorVerifiedKey) === 'true';
      console.log("Is 2FA already verified (localStorage):", isVerified);
      
      // Set authentication state based on 2FA requirements and verification
      const isFullyAuthenticated = !requiresTwoFactor || isVerified;
      console.log("Setting authentication state:", {
        isAuthenticated: isFullyAuthenticated,
        needsTwoFactor: requiresTwoFactor,
        twoFactorVerified: isVerified
      });
      
      setNeedsTwoFactor(requiresTwoFactor);
      setTwoFactorVerified(isVerified);
      setIsAuthenticated(isFullyAuthenticated);
    } else {
      console.error("Failed to fetch user data after login");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    }
  }, [fetchUserData]);

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
                // Important: Clear 2FA verification on sign out
                localStorage.removeItem(TwoFactorVerifiedKey);
                setTwoFactorVerified(false);
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
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
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
    isDistributor: role === 'distributor',
    sessionChecked,
    needsTwoFactor,
    twoFactorVerified,
    setTwoFactorComplete,
    clearTwoFactorVerification
  };
};
