
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate, isAuthenticated]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">
          {t("welcomeMessage")}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t("systemDescription")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/login")}
          >
            {t("login")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/signup")}
          >
            {t("createAccount")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;
