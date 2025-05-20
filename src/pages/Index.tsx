
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, sessionChecked, needsTwoFactor, twoFactorVerified } = useAuth();
  const { t } = useLanguage();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Only proceed when the session check is complete
    if (!sessionChecked) {
      return;
    }

    console.log("Index page: Auth state check complete", {
      isAuthenticated,
      needsTwoFactor,
      twoFactorVerified
    });

    // Set a short timeout to ensure state is settled
    const timer = setTimeout(() => {
      // If authenticated and 2FA is verified (or not needed), go to dashboard
      if (isAuthenticated && (!needsTwoFactor || twoFactorVerified)) {
        console.log("Index: Redirecting to dashboard, user is fully authenticated");
        navigate("/dashboard");
      } 
      // If needs 2FA but not verified, send to two-factor
      else if (isAuthenticated && needsTwoFactor && !twoFactorVerified) {
        console.log("Index: Redirecting to two-factor auth");
        navigate("/two-factor");
      }
      // Not authenticated, go to login
      else {
        console.log("Index: Redirecting to login, user is not authenticated");
        navigate("/login");
      }
      
      setAuthCheckComplete(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, sessionChecked, needsTwoFactor, twoFactorVerified]);

  // Show loading while checking auth status
  if (loading || !sessionChecked || !authCheckComplete) {
    return <Loading text={t("checkingAuthStatus") || "جاري التحقق من حالة تسجيل الدخول..."} />;
  }

  return null;
};

export default Index;
