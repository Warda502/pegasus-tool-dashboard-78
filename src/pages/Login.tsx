
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    // If already authenticated, redirect to dashboard
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        setLoading(false);
      }
      // No need for navigation here, it's handled in the login function
    } catch (error) {
      setLoading(false);
      toast(t("error") || "Error", {
        description: error instanceof Error ? error.message : t("unexpectedError") || "Unexpected error",
      });
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t("login") || "Login"}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t("email") || "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label htmlFor="password">{t("password") || "Password"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (t("loggingIn") || "Logging in...") : (t("login") || "Login")}
          </Button>
          <div className="text-center mt-4">
            <p>
              {t("noAccount") || "Don't have an account?"}{" "}
              <Button
                variant="link"
                className="p-0 mx-1"
                onClick={() => navigate("/signup")}
              >
                {t("createAccount") || "Create a new account"}
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
