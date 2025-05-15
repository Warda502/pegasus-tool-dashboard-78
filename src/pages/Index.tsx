
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, sessionChecked } = useAuth();

  useEffect(() => {
    if (sessionChecked) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [navigate, isAuthenticated, sessionChecked]);

  // Return a loading state or null while checking
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
