
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, sessionChecked } = useAuth();

  useEffect(() => {
    if (loading || !sessionChecked) {
      return; // Wait until authentication is checked
    }

    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate, isAuthenticated, loading, sessionChecked]);

  // Show loading while checking auth status
  if (loading || !sessionChecked) {
    return <Loading text="جاري التحقق من حالة الدخول..." />;
  }

  return null;
};

export default Index;
