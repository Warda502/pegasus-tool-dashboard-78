
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

// Key for tracking login status
const LOGIN_IN_PROGRESS_KEY = "login_in_progress";

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
    clearTwoFactorVerification
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
    console.log("Login page mount - auth state:", {
      isAuthenticated,
      needsTwoFactor,
      sessionChecked
    });
    
    const loginInProgress = localStorage.getItem(LOGIN_IN_PROGRESS_KEY) === 'true';
    
    // Only clear if not in login flow
    if (!needsTwoFactor && !loginInProgress) {
      console.log("Clearing 2FA verification state on login page load");
      clearTwoFactorVerification();
      localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
    }
    
    // Clear login in progress flag when component unmounts
    return () => {
      // Only clear if not transitioning to dashboard
      if (window.location.pathname !== '/dashboard') {
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
      }
    };
  }, [clearTwoFactorVerification, needsTwoFactor, isAuthenticated, sessionChecked]);

  useEffect(() => {
    if (notificationsShown || !sessionChecked) return;
    
    setNotificationsShown(true);
    
    const passwordReset = searchParams.get("passwordReset");
    if (passwordReset === "success") {
      toast(t("passwordResetSuccess") || "تم إعادة تعيين كلمة المرور بنجاح", {
        description: t("pleaseLoginWithNewPassword") || "يرجى تسجيل الدخول باستخدام كلمة المرور الجديدة"
      });
    }
    
    const sessionExpired = searchParams.get("sessionExpired");
    if (sessionExpired === "true") {
      toast(t("sessionExpired") || "انتهت صلاحية الجلسة", {
        description: t("pleaseLoginAgain") || "يرجى تسجيل الدخول مجددًا"
      });
    }
    
    const loggedOut = searchParams.get("loggedOut");
    if (loggedOut === "true") {
      toast(t("loggedOutSuccess") || "تم تسجيل الخروج بنجاح", {
        description: t("comeBackSoon") || "نتطلع لعودتك قريبًا"
      });
    }
    
    const loggedOutInAnotherTab = searchParams.get("loggedOutInAnotherTab");
    if (loggedOutInAnotherTab === "true") {
      toast(t("loggedOutInAnotherTab") || "تم تسجيل الخروج في نافذة أخرى", {
        description: t("sessionEnded") || "انتهت جلستك"
      });
    }
  }, [searchParams, t, notificationsShown, sessionChecked]);

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
    if (sessionChecked && isAuthenticated) {
      console.log("User is authenticated and 2FA verified (if needed), redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Set login in progress flag
    localStorage.setItem(LOGIN_IN_PROGRESS_KEY, 'true');

    try {
      // Clear any previous 2FA state
      clearTwoFactorVerification();
      setOtpCode('');
      
      // Skip captcha validation in development
      if (isProdDomain && !captchaToken) {
        toast(t("captchaRequired") || "يرجى إكمال اختبار التحقق", {
          description: t("captchaRequiredDesc") || "يرجى إكمال اختبار التحقق للمتابعة"
        });
        setIsSubmitting(false);
        setCaptchaError(true);
        return;
      }

      login(email, password).then(success => {
        if (!success) {
          // Login failed
          setIsSubmitting(false);
          localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      toast(t("loginFailed") || "فشل تسجيل الدخول", {
        description: err instanceof Error ? err.message : t("unexpectedError") || "حدث خطأ غير متوقع"
      });
      setIsSubmitting(false);
      localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
    }
  }
  
  function handleOTPVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    if (otpCode.length !== 6 || !user) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Verifying 2FA code:", otpCode);
    
    verifyTwoFactor(user.id, otpCode).then(isValid => {
      if (!isValid) {
        // Invalid OTP
        setOtpCode('');
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
      }
      setIsSubmitting(false);
    }).catch(error => {
      console.error("OTP verification error:", error);
      toast(t("verificationFailed") || "فشل التحقق", {
        description: error instanceof Error ? error.message : t("unexpectedError") || "حدث خطأ غير متوقع"
      });
      localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
      setIsSubmitting(false);
    });
  }
  
  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }
  
  function handleCaptchaSolved(token: string) {
    setCaptchaToken(token);
    setCaptchaError(false);
  }
  
  function handleCaptchaError() {
    setCaptchaError(true);
    setCaptchaToken("");
  }
  
  function handleCaptchaExpired() {
    setCaptchaToken("");
  }
  
  function handleBack() {
    // For 2FA screen: go back to credentials, but only if not in the middle of the auth flow
    if (!user) {
      setLoginStage('credentials');
      setOtpCode('');
      localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
    } else {
      // If in auth flow with a user, log out and go back to credentials
      supabase.auth.signOut().then(() => {
        setLoginStage('credentials');
        setOtpCode('');
        clearTwoFactorVerification();
        localStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
      });
    }
  }

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
          <h2 className="text-3xl font-bold text-gray-900">{t("login") || "تسجيل الدخول"}</h2>
        </div>
        
        {loginStage === 'credentials' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">{t("email") || "البريد الإلكتروني"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir={isRTL ? "rtl" : "ltr"}
                  autoComplete="email"
                  placeholder={t("enterEmail") || "أدخل بريدك الإلكتروني"}
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password") || "كلمة المرور"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir={isRTL ? "rtl" : "ltr"}
                    autoComplete="current-password"
                    placeholder={t("enterPassword") || "أدخل كلمة المرور"}
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
              {isSubmitting ? (t("loggingIn") || "جاري تسجيل الدخول...") : (t("login") || "تسجيل الدخول")}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPVerify}>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("twoFactorAuth") || "المصادقة الثنائية"}</h3>
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-sm text-gray-600">
              {t("enterVerificationCode") || "أدخل رمز التحقق من تطبيق المصادقة"}
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
                {t("useAuthenticatorApp") || "استخدم تطبيق المصادقة للحصول على الرمز"}
              </p>
            </div>
            
            <div className="pt-2 flex flex-col gap-2">
              <Button 
                type="submit"
                disabled={otpCode.length !== 6 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (t("verifying") || "جاري التحقق...") : (t("verify") || "تحقق")}
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
