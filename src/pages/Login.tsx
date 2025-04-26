
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { Loading } from "@/components/ui/loading";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, sessionChecked, loading, login } = useAuth();
  const [notificationsShown, setNotificationsShown] = useState(false);

  // Handle any query params (like from password reset or session expired)
  useEffect(() => {
    if (notificationsShown || !sessionChecked) return;
    
    // Only show notifications once to avoid duplicates
    setNotificationsShown(true);
    
    const passwordReset = searchParams.get("passwordReset");
    if (passwordReset === "success") {
      toast(t("passwordResetSuccess"), {
        description: t("pleaseLoginWithNewPassword")
      });
    }
    
    const sessionExpired = searchParams.get("sessionExpired");
    if (sessionExpired === "true") {
      console.log("Session expired param detected");
      // Toast is already shown by the handleSessionExpired function in useAuth
    }
    
    const loggedOut = searchParams.get("loggedOut");
    if (loggedOut === "true") {
      // Toast is already shown by the logout function in useAuth
    }
  }, [searchParams, t, notificationsShown, sessionChecked]);

  // Redirect if already authenticated
  useEffect(() => {
    if (sessionChecked && isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // اعرض شاشة تحميل حتى نتأكد من حالة المصادقة
  if (!sessionChecked || loading) {
    return <Loading text={t("checkingSession") || "جاري التحقق من حالة الجلسة..."} className="min-h-screen" />;
  }

  // لا تعرض نموذج تسجيل الدخول إذا كان المستخدم مسجل دخوله بالفعل
  if (isAuthenticated) {
    return null;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t("login")}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir={isRTL ? "rtl" : "ltr"}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir={isRTL ? "rtl" : "ltr"}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? t("loggingIn") : t("login")}
          </Button>

          <div className="text-center mt-2">
            <Button
              variant="link"
              className="p-0 mx-1"
              onClick={() => navigate("/change-password")}
            >
              {t("forgotPassword")}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p>
              {t("noAccount")}{" "}
              <Button
                variant="link"
                className="p-0 mx-1"
                onClick={() => navigate("/signup")}
              >
                {t("createAccount")}
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
