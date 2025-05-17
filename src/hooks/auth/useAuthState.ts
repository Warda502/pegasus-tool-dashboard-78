
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, UserRole, AuthState } from "./types";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

// Key for storing 2FA verification state in localStorage
const TwoFactorVerifiedKey = "auth_2fa_verified";
// Key for storing session stability flag
const SessionStabilityKey = "session_stability";

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

  // Function to safely fetch user data without crashing on errors
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log("Fetching complete user data for ID:", userId);
      
      // Protect against fetch errors by adding timeouts
      const fetchPromise = new Promise<AuthUser | null>(async (resolve, reject) => {
        try {
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
            
            // Determine user role
            let userRole: UserRole = "user";
            const emailType = (userDataById.email_type || '').toLowerCase();
            
            if (emailType === 'admin') {
              userRole = "admin";
              // Mark admin sessions explicitly to help maintain stability
              localStorage.setItem(SessionStabilityKey, 'admin');
            } else if (emailType === 'distributor') {
              userRole = "distributor";
              localStorage.setItem(SessionStabilityKey, 'distributor');
            } else {
              localStorage.setItem(SessionStabilityKey, 'user');
            }
            
            // Check if user has 2FA enabled
            const hasTwoFactorEnabled = userDataById.two_factor_enabled || false;
            setNeedsTwoFactor(hasTwoFactorEnabled);
            
            const isVerified = localStorage.getItem(TwoFactorVerifiedKey) === 'true';
            console.log("2FA verification status from localStorage:", isVerified);
            
            if (hasTwoFactorEnabled) {
              setTwoFactorVerified(isVerified);
            } else {
              // No 2FA needed, so it's "verified" by default
              setTwoFactorVerified(true);
              localStorage.removeItem(TwoFactorVerifiedKey);
            }
            
            resolve({
              id: userDataById.id,
              email: userDataById.email,
              name: userDataById.name || '',
              role: userRole,
              credits: userDataById.credits,
              expiryTime: userDataById.expiry_time,
              uid: userDataById.uid,
              twoFactorEnabled: hasTwoFactorEnabled
            });
            return;
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
            resolve(null);
            return;
          }
          
          if (!userDataByUid) {
            console.error("No user data found by either ID or UID");
            resolve(null);
            return;
          }

          console.log("User data found by UID:", userDataByUid);
          
          // Determine user role
          let userRole: UserRole = "user";
          const emailType = (userDataByUid.email_type || '').toLowerCase();
          
          if (emailType === 'admin') {
            userRole = "admin";
            localStorage.setItem(SessionStabilityKey, 'admin');
          } else if (emailType === 'distributor') {
            userRole = "distributor";
            localStorage.setItem(SessionStabilityKey, 'distributor');
          } else {
            localStorage.setItem(SessionStabilityKey, 'user');
          }
          
          // Check if user has 2FA enabled
          const hasTwoFactorEnabled = userDataByUid.two_factor_enabled || false;
          setNeedsTwoFactor(hasTwoFactorEnabled);
          
          const isVerified = localStorage.getItem(TwoFactorVerifiedKey) === 'true';
          console.log("2FA verification status from localStorage:", isVerified);
          
          if (hasTwoFactorEnabled) {
            setTwoFactorVerified(isVerified);
          } else {
            setTwoFactorVerified(true);
            localStorage.removeItem(TwoFactorVerifiedKey);
          }
          
          resolve({
            id: userDataByUid.id,
            email: userDataByUid.email,
            name: userDataByUid.name || '',
            role: userRole,
            credits: userDataByUid.credits,
            expiryTime: userDataByUid.expiry_time,
            uid: userDataByUid.uid,
            twoFactorEnabled: hasTwoFactorEnabled
          });
        } catch (err) {
          console.error("Error in fetchUserData:", err);
          resolve(null);
        }
      });
      
      // Set a timeout to ensure we don't hang indefinitely
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          reject(new Error("User data fetch timeout"));
        }, 5000); // 5 second timeout
      });
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      // Don't crash, just return null
      return null;
    }
  }, []);

  // Method to mark 2FA as verified
  const setTwoFactorComplete = useCallback(() => {
    console.log("Marking 2FA as verified and storing in localStorage");
    setTwoFactorVerified(true);
    localStorage.setItem(TwoFactorVerifiedKey, 'true');
    setIsAuthenticated(true);
  }, []);

  // Method to clear 2FA verification (used on logout)
  const clearTwoFactorVerification = useCallback(() => {
    console.log("Clearing 2FA verification status");
    localStorage.removeItem(TwoFactorVerifiedKey);
    localStorage.removeItem(SessionStabilityKey);
    setTwoFactorVerified(false);
  }, []);

  // Improved session handling with better error isolation
  const handleSession = useCallback(async (session: Session | null) => {
    if (!session) {
      console.log("No active session - clearing auth state");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setNeedsTwoFactor(false);
      setTwoFactorVerified(false);
      localStorage.removeItem(TwoFactorVerifiedKey);
      localStorage.removeItem(SessionStabilityKey);
      return;
    }
    
    console.log("Processing session for:", session.user.email);
    
    // Preserve session stability for admins by checking saved role
    const savedRole = localStorage.getItem(SessionStabilityKey);
    if (savedRole === 'admin') {
      console.log("Preserving admin session stability");
    }
    
    // Fetch user data with a small delay to ensure DB is ready
    // Wrap in try/catch to avoid breaking auth state
    try {
      setTimeout(async () => {
        try {
          const userData = await fetchUserData(session.user.id);
          if (userData) {
            console.log("Setting user data:", userData);
            setUser(userData as AuthUser);
            setRole(userData.role as UserRole);
            
            const requiresTwoFactor = userData.twoFactorEnabled || false;
            console.log("User requires 2FA:", requiresTwoFactor);
            
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
            // Don't reset authentication state if we failed to fetch data
            // This prevents logout-loop for admins
            if (savedRole === 'admin') {
              console.log("Preserving admin session despite data fetch failure");
            } else {
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error("Error in user data fetch:", error);
          // Keep session active for admins even on fetch error
          if (savedRole === 'admin') {
            console.log("Preserving admin session despite error");
          }
        }
      }, 500);
    } catch (error) {
      console.error("Critical error in session handler:", error);
      // Even on critical error, we shouldn't log out admins automatically
      if (savedRole === 'admin') {
        console.log("Preserving admin session despite critical error");
      }
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
                localStorage.removeItem(TwoFactorVerifiedKey);
                localStorage.removeItem(SessionStabilityKey);
                setTwoFactorVerified(false);
                break;
              
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
              case 'USER_UPDATED':
              case 'INITIAL_SESSION':
                if (session) {
                  // Use setTimeout to avoid potential deadlocks with Supabase auth
                  setTimeout(() => {
                    try {
                      handleSession(session);
                    } catch (error) {
                      console.error("Error handling session:", error);
                    }
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
