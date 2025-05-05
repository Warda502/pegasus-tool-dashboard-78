
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { supabase } from "@/integrations/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, sessionChecked, loading, login } = useAuth();
  const [notificationsShown, setNotificationsShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  
  // Updated with the actual production site key
  const TURNSTILE_SITE_KEY = "0x4AAAAAABaWWRRhV8b4zFQC"; 
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (notificationsShown || !sessionChecked) return;
    
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
    }
    
    const loggedOut = searchParams.get("loggedOut");
    if (loggedOut === "true") {
    }
  }, [searchParams, t, notificationsShown, sessionChecked]);

  useEffect(() => {
    if (sessionChecked && isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate CAPTCHA
    if (!captchaToken) {
      toast(t("captchaRequired"), {
        description: t("pleaseCompleteCaptcha")
      });
      setCaptchaError(true);
      setIsSubmitting(false);
      return;
    }

    try {
      // First, check if email exists and if the user is blocked or has no credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, email_type, block, credits')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error checking user:", userError);
        // Continue with login attempt as normal
      } else if (userData) {
        // Check if this is a regular user (not an admin)
        if (userData.email_type.toLowerCase() !== 'admin') {
          // Check if user is blocked
          if (userData.block === 'Blocked') {
            toast(t("accountBlocked"), {
              description: t("accountBlockedDescription")
            });
            setIsSubmitting(false);
            return;
          }

          // Check if user has no credits
          const creditsValue = parseFloat(userData.credits.toString().replace(/"/g, ''));
          if (!isNaN(creditsValue) && creditsValue <= 0) {
            toast(t("noCreditsLeft"), {
              description: t("noCreditsLeftDescription")
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Proceed with normal login if all checks pass
      await login(email, password);
    } catch (err) {
      console.error("Login validation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCaptchaSolved = (token: string) => {
    setCaptchaToken(token);
    setCaptchaError(false);
  };

  const handleCaptchaError = () => {
    setCaptchaError(true);
    setCaptchaToken("");
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken("");
  };

  if (!sessionChecked || loading) {
    return <Loading text={t("checkingSession") || "جاري التحقق من حالة الجلسة..."} className="min-h-screen" />;
  }

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
            <div className={`flex justify-center ${captchaError ? 'border border-red-500 rounded-md p-2' : ''}`}>
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={handleCaptchaSolved}
                onError={handleCaptchaError}
                onExpire={handleCaptchaExpired}
                options={{
                  theme: 'light',
                  language: isRTL ? 'ar' : 'en',
                }}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || loading || !captchaToken}
            className="w-full"
          >
            {isSubmitting ? t("loggingIn") : t("login")}
          </Button>
        </form>
      </div>
    </div>
  );
}
