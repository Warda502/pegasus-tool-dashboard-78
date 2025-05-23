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
        
        // Determine user role - now includes distributor check
        let userRole: UserRole;
        if ((userDataById.email_type || '').toLowerCase() === 'admin') {
          userRole = 'admin';
        } else if ((userDataById.email_type || '').toLowerCase() === 'distributor') {
          userRole = 'distributor';
        } else {
          userRole = 'user';
        }
        
        // Check if user has 2FA enabled
        const hasTwoFactorEnabled = userDataById.two_factor_enabled || false;
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
      
      // Determine user role - now includes distributor check
      let userRole: UserRole;
      if ((userDataByUid.email_type || '').toLowerCase() === 'admin') {
        userRole = 'admin';
      } else if ((userDataByUid.email_type || '').toLowerCase() === 'distributor') {
        userRole = 'distributor';
      } else {
        userRole = 'user';
      }
      
      // Check if user has 2FA enabled
      const hasTwoFactorEnabled = userDataByUid.two_factor_enabled || false;
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
  }, []);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    console.log("Marking 2FA as verified and storing in localStorage");
    setTwoFactorVerified(true);
    // Store 2FA verification status in localStorage to persist across page reloads
    localStorage.setItem(TwoFactorVerifiedKey, 'true');
    setIsAuthenticated(true);
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
    
    // Fetch user data with a small delay to ensure DB is ready
    setTimeout(async () => {
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
        
        setIsAuthenticated(isFullyAuthenticated);
      } else {
        console.error("Failed to fetch user data after login");
        setIsAuthenticated(false);
      }
    }, 500);
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
