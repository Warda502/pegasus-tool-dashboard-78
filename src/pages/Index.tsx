
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isDistributor, sessionChecked } = useAuth();

  useEffect(() => {
    if (sessionChecked) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [navigate, isAuthenticated, sessionChecked, isAdmin, isDistributor]);

  return null;
};

export default Index;
