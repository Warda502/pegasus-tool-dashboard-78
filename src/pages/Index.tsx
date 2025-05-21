
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // Updated import path
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, sessionChecked, needsTwoFactor, twoFactorVerified, initialized, role, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Only proceed when auth context is initialized
    if (!initialized) {
      console.log("Index page: Waiting for auth context to initialize");
      return;
    }

    // Only proceed when the session check is complete
    if (!sessionChecked) {
      console.log("Index page: Waiting for session check to complete");
      return;
    }

    console.log("Index page: Auth state check complete", {
      isAuthenticated,
      needsTwoFactor,
      twoFactorVerified,
      initialized,
      role,
      isAdmin
    });

    // Use more reliable approach without setTimeout
    if (isAuthenticated) {
      if (!needsTwoFactor || twoFactorVerified) {
        console.log("Index: Redirecting to dashboard, user is fully authenticated");
        console.log("User role:", role, "isAdmin:", isAdmin);
        navigate("/dashboard");
      } else {
        console.log("Index: Redirecting to two-factor auth");
        navigate("/two-factor");
      }
    } else {
      console.log("Index: Redirecting to login, user is not authenticated");
      navigate("/login");
    }
    
    setAuthCheckComplete(true);
  }, [navigate, isAuthenticated, sessionChecked, needsTwoFactor, twoFactorVerified, initialized, role, isAdmin]);

  // Show loading while checking auth status
  if (loading || !sessionChecked || !authCheckComplete || !initialized) {
    return <Loading text={t("checkingAuthStatus") || "جاري التحقق من حالة تسجيل الدخول..."} />;
  }

  return null;
};

export default Index;
