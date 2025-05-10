
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { AuthActions } from "./types";
import { validate2FAToken } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful via useAuthActions");
      
      // Initial auth is successful, but we need to check if 2FA is required
      // The actual navigation to dashboard will happen after 2FA verification if needed
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('email_type, block, credits, two_factor_enabled')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (userDataError) {
        console.error("Error fetching user data after login:", userDataError);
        throw userDataError;
      }

      console.log("User data from database:", userData);
      
      // Only show success toast if 2FA is not required
      if (!userData?.two_factor_enabled) {
        toast(t("loginSuccess"), {
          description: t("welcomeBack")
        });
        
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
        toast(t("loginSuccess") || "Login successful", {
          description: t("welcomeBack") || "Welcome back"
        });
        
        navigate('/dashboard');
      } else {
        toast(t("invalidOTP") || "Invalid verification code", {
          description: t("invalidOTPDescription") || "Please try again with the correct code"
        });
      }
      
      return isValid;
    } catch (error) {
      console.error("2FA verification error:", error);
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
        navigate('/login?loggedOut=true');
        return true;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
