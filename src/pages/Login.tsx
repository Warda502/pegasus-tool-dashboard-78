import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Eye, EyeOff, Key } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { supabase, validate2FAToken } from "@/integrations/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Add a type for error details
type LoginError = {
  message: string;
  details?: string;
};

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
  
  // 2FA fields
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [tempSession, setTempSession] = useState<any>(null);
  
  // Updated with the actual production site key
  const TURNSTILE_SITE_KEY = "0x4AAAAAABaWWRRhV8b4zFQC"; 
  const turnstileRef = useRef(null);
  
  // Check if the current domain is the production domain
  const isProdDomain = window.location.origin === "https://panel.pegasus-tools.com";
  // If not on prod domain, we'll skip captcha validation

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

    // Clear any previous errors
    let loginError: LoginError | null = null;

    try {
      // First, check if email exists and if the user is blocked or has no credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, email_type, block, credits, two_factor_enabled')
        .eq('email', email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error checking user:", userError);
        // Continue with login attempt as normal
      } else if (userData) {
        // Check if this is a regular user (not an admin)
        if (userData.email_type && userData.email_type.toLowerCase() !== 'admin') {
          // Check if user is blocked
          if (userData.block === 'Blocked') {
            toast(t("accountBlocked"), {
              description: t("accountBlockedDescription")
            });
            setIsSubmitting(false);
            return;
          }

          // Check if user has no credits
          if (userData.credits) {
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
      }

      // Attempt Supabase Auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        loginError = { 
          message: t("loginFailed") || "Login failed", 
          details: authError.message 
        };
        throw new Error(authError.message);
      }
      
      // If the user has 2FA enabled, show the OTP dialog
      if (userData?.two_factor_enabled) {
        setTempSession(authData.session);
        setShowOTPDialog(true);
        setIsSubmitting(false);
        return;
      }
      
      // If no 2FA, proceed with normal login
      await login(email, password);
    } catch (err) {
      console.error("Login validation error:", err);
      
      if (loginError) {
        toast(loginError.message, {
          description: loginError.details || t("unexpectedError") || "An unexpected error occurred"
        });
      } else {
        toast(t("loginFailed") || "Login failed", {
          description: err instanceof Error ? err.message : t("unexpectedError") || "An unexpected error occurred"
        });
      }
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async () => {
    if (otpCode.length !== 6 || !tempSession) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verify the OTP code with improved error handling
      const userId = tempSession.user.id;
      let isValid = false;
      
      try {
        isValid = await validate2FAToken(userId, otpCode);
      } catch (error) {
        console.error("Error during OTP validation:", error);
        toast(t("verificationFailed") || "Verification failed", {
          description: "Error validating 2FA code. Please check your connection and try again."
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!isValid) {
        toast(t("invalidOTP") || "Invalid verification code", {
          description: t("invalidOTPDescription") || "Please try again with the correct code"
        });
        setIsSubmitting(false);
        return;
      }
      
      // OTP verified, continue with login
      toast(t("loginSuccess") || "Login successful", {
        description: t("welcomeBack") || "Welcome back"
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("OTP verification error:", error);
      toast(t("verificationFailed") || "Verification failed", {
        description: error instanceof Error ? error.message : t("unexpectedError") || "An unexpected error occurred"
      });
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
            {/* Only show captcha on production domain */}
            {isProdDomain && (
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
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || loading || (isProdDomain && !captchaToken)}
            className="w-full"
          >
            {isSubmitting ? t("loggingIn") : t("login")}
          </Button>
        </form>
      </div>
      
      {/* 2FA Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={(open) => {
        // Prevent closing the dialog by clicking outside
        if (!open && tempSession) {
          // Only allow closing if no tempSession
          return;
        }
        setShowOTPDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                {t("twoFactorAuth") || "Two-Factor Authentication"}
              </div>
            </DialogTitle>
            <DialogDescription>{t("enterVerificationCode") || "Enter the verification code from your authenticator app"}</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-full space-y-2">
              <Label className="text-center block">{t("authenticationCode") || "Authentication Code"}</Label>
              <InputOTP 
                maxLength={6} 
                value={otpCode}
                onChange={setOtpCode}
                disabled={isSubmitting}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t("useAuthenticatorApp") || "Use your authenticator app to get the code"}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleOTPVerify}
              disabled={otpCode.length !== 6 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t("verifying") : t("verify") || "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
