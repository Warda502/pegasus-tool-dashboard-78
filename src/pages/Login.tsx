import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Eye, EyeOff, Key, ShieldCheck, ArrowLeft } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { supabase } from "@/integrations/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { 
    isAuthenticated, 
    sessionChecked, 
    loading, 
    login, 
    verifyTwoFactor,
    needsTwoFactor,
    user,
    setTwoFactorComplete,
    clearTwoFactorState
  } = useAuth();
  const [notificationsShown, setNotificationsShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  
  // Login stages
  const [loginStage, setLoginStage] = useState<'credentials' | '2fa'>('credentials');
  const [otpCode, setOtpCode] = useState("");
  
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
      // No need for any message here
    }
  }, [searchParams, t, notificationsShown, sessionChecked]);

  // Add this effect to debug auth status
  useEffect(() => {
    console.log("Login component - auth status:", { 
      isAuthenticated, 
      needsTwoFactor, 
      sessionChecked,
      user: !!user 
    });
  }, [isAuthenticated, needsTwoFactor, sessionChecked, user]);

  // Monitor needsTwoFactor state to show 2FA screen
  useEffect(() => {
    console.log("2FA status changed - needs 2FA:", needsTwoFactor, "current stage:", loginStage);
    
    if (needsTwoFactor && loginStage === 'credentials') {
      console.log("2FA required, showing 2FA input");
      setLoginStage('2fa');
    }
  }, [needsTwoFactor, loginStage]);

  useEffect(() => {
    // Only redirect if user is fully authenticated (passed 2FA if needed)
    // Critical check: isAuthenticated will only be true if user has passed 2FA verification
    if (sessionChecked && isAuthenticated) {
      console.log("User is authenticated and 2FA verified (if needed), redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clear any previous 2FA state
      setOtpCode('');
      
      // First, check if email exists and if the user is blocked or has no credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, email_type, block, credits, two_factor_enabled')
        .eq('email', email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error checking user:", userError);
      } else if (userData) {
        // Check if user is blocked
        if (userData.block === 'Blocked') {
          toast(t("accountBlocked"), {
            description: t("accountBlockedDescription")
          });
          setIsSubmitting(false);
          return;
        }

        // Check if user has no credits (for regular users)
        if (userData.email_type && userData.email_type.toLowerCase() !== 'admin') {
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

      console.log("Attempting login after pre-checks");
      const result = await login(email, password);
      
      if (result) {
        console.log("Login successful, waiting for 2FA check if needed");
      } else {
        // Login failed
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Login validation error:", err);
      toast(t("loginFailed") || "Login failed", {
        description: err instanceof Error ? err.message : t("unexpectedError") || "An unexpected error occurred"
      });
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (otpCode.length !== 6 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Verifying 2FA code:", otpCode);
    
    try {
      // Use the verifyTwoFactor method from our auth context
      const isValid = await verifyTwoFactor(user.id, otpCode);
      
      if (isValid) {
        // 2FA verification successful
        setTwoFactorComplete();
        console.log("2FA verification successful, will redirect to dashboard");
        // Add a small delay to ensure state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        // Invalid OTP - message is shown by verifyTwoFactor
        setOtpCode('');
      }
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
  
  const handleBack = () => {
    // For 2FA screen: go back to credentials, but only if not in the middle of the auth flow
    if (!user) {
      setLoginStage('credentials');
      setOtpCode('');
    } else {
      // If in auth flow with a user, log out and go back to credentials
      clearTwoFactorState(); // Clear 2FA state
      supabase.auth.signOut().then(() => {
        setLoginStage('credentials');
        setOtpCode('');
      });
    }
  };

  if (!sessionChecked || loading) {
    return <Loading text={t("checkingSession") || "جاري التحقق من حالة الجلسة..."} className="min-h-screen" />;
  }

  // Don't render anything if we're already authenticated and should be redirected
  if (isAuthenticated) {
    return null;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t("login")}</h2>
        </div>
        
        {loginStage === 'credentials' ? (
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
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPVerify}>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("twoFactorAuth") || "Two-Factor Authentication"}</h3>
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-sm text-gray-600">
              {t("enterVerificationCode") || "Enter the verification code from your authenticator app"}
            </p>
            
            <div className="flex flex-col items-center space-y-4">
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
              
              <p className="text-sm text-muted-foreground text-center">
                {t("useAuthenticatorApp") || "Use your authenticator app to get the code"}
              </p>
            </div>
            
            <div className="pt-2 flex flex-col gap-2">
              <Button 
                type="submit"
                disabled={otpCode.length !== 6 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t("verifying") || "جاري التحقق..." : t("verify") || "تحقق"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
                {t("back") || "رجوع"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
