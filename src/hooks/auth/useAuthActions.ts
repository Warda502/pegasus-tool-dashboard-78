
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { AuthActions } from "./types";
import { validate2FAToken } from "@/integrations/supabase/client";

// Key for tracking login status
const LOGIN_IN_PROGRESS_KEY = "login_in_progress";
const TwoFactorVerifiedKey = "auth_2fa_verified";

export const useAuthActions = (): AuthActions => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const checkSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check error:", error);
        return false;
      }

      if (!data.session) {
        console.log("No active session found in checkSession");
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (data.session.expires_at && data.session.expires_at < currentTime) {
        console.log("Session expired");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in checkSession:", err);
      return false;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    console.log("Handling session expiration");

    // Clear any 2FA verification state
    localStorage.removeItem(TwoFactorVerifiedKey);
    localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);

    if (window.location.pathname !== '/login') {
      toast(t("sessionExpired") || "انتهت صلاحية الجلسة", {
        description: t("pleaseLoginAgain") || "يرجى تسجيل الدخول مجددًا"
      });

      navigate('/login?sessionExpired=true');
    }
  }, [navigate, t]);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);

      // Set login in progress
      localStorage.setItem(LOGIN_IN_PROGRESS_KEY, 'true');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
        throw error;
      }

      console.log("Login successful via useAuthActions");

      // Initial auth is successful, but we need to check if 2FA is required
      // The actual navigation to dashboard will happen after 2FA verification if needed
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('email_type, block, credits, two_factor_enabled, role')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (userDataError) {
        console.error("Error fetching user data after login:", userDataError);
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
        throw userDataError;
      }

      console.log("User data from database:", userData);

      // إذا كان المستخدم موزعًا، قم بجلب بيانات الموزع
      if (userData?.role === 'distributor') {
        const { data: distributorData, error: distributorError } = await supabase
          .from('distributors')
          .select('*')
          .eq('uid', data.session.user.id)
          .single();

        if (distributorError) {
          console.error("Error fetching distributor data after login:", distributorError);
        } else {
          console.log("Distributor data from database:", distributorData);
        }
      }

      // Only show success toast if 2FA is not required
      if (!userData?.two_factor_enabled) {
        toast(t("loginSuccess"), {
          description: t("welcomeBack")
        });

        // No 2FA needed, clear flag and redirect
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
        navigate('/dashboard');
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast(t("loginFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
      return false;
    }
  };

  const verifyTwoFactor = async (userId: string, token: string) => {
    try {
      console.log("Verifying 2FA token for user:", userId, "Token:", token);

      const isValid = await validate2FAToken(userId, token);
      console.log("2FA validation result:", isValid);

      if (isValid) {
        // Store 2FA verification in localStorage
        localStorage.setItem(TwoFactorVerifiedKey, 'true');

        toast(t("loginSuccess") || "Login successful", {
          description: t("welcomeBack") || "Welcome back"
        });

        // Navigate after small delay to allow state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 200);
      } else {
        localStorage.removeItem(TwoFactorVerifiedKey);

        toast(t("invalidOTP") || "Invalid verification code", {
          description: t("invalidOTPDescription") || "Please try again with the correct code"
        });
      }

      return isValid;
    } catch (error) {
      console.error("2FA verification error:", error);
      localStorage.removeItem(TwoFactorVerifiedKey);

      toast(t("verificationFailed") || "Verification failed", {
        description: error instanceof Error ? error.message : t("unexpectedError") || "An unexpected error occurred"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const isSessionValid = await checkSession();

      if (!isSessionValid) {
        console.log("No valid session found, cleaning up local state");

        // Clear all authentication related storage
        localStorage.removeItem(TwoFactorVerifiedKey);
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);

        navigate('/login?loggedOut=true');
        return true;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear 2FA verification state on logout
      localStorage.removeItem(TwoFactorVerifiedKey);
      localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);

      toast(t("logoutSuccess"), {
        description: t("comeBackSoon")
      });

      navigate('/login?loggedOut=true');
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
    login,
    logout,
    checkSession,
    handleSessionExpired,
    verifyTwoFactor
  };
};
