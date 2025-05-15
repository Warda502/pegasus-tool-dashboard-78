import { useState, useCallback } from "react";
import { AuthUser, UserRole } from "./types";

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);

  // Function to set 2FA verification is complete
  const setTwoFactorComplete = useCallback(() => {
    setTwoFactorVerified(true);
    setNeedsTwoFactor(false);
  }, []);

  // Function to clear 2FA verification state
  const clearTwoFactorVerification = useCallback(() => {
    setTwoFactorVerified(false);
    setNeedsTwoFactor(false);
  }, []);

  return {
    loading,
    user,
    role,
    isAuthenticated,
    isAdmin: role === 'admin',
    isDistributor: role === 'distributor',
    sessionChecked,
    needsTwoFactor,
    twoFactorVerified,
    setTwoFactorComplete,
    clearTwoFactorVerification,
  };
};
