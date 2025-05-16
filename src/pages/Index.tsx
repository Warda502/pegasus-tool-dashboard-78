
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isDistributor } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate("/dashboard");
      } else if (isDistributor) {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [navigate, isAuthenticated, isAdmin, isDistributor]);

  return null;
};

export default Index;
