
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "../useLanguage";
import { AuthActions } from "./types";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast(t("loginSuccess"), {
        description: t("welcomeBack")
      });
      
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast(t("loginFailed"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
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
    handleSessionExpired
  };
};
