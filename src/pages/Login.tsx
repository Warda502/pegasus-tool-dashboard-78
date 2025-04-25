
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Handle any query params (like from password reset)
  useEffect(() => {
    const passwordReset = searchParams.get("passwordReset");
    if (passwordReset === "success") {
      toast(t("passwordResetSuccess"), {
        description: t("pleaseLoginWithNewPassword")
      });
    }
  }, [searchParams, t]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        toast(t("loginSuccess"), {
          description: t("welcomeBack")
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("unexpectedError")
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir={isRTL ? "rtl" : "ltr"}
                autoComplete="current-password"
              />
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
};
