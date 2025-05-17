
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isDistributor, sessionChecked } = useAuth();

  useEffect(() => {
    console.log("Index page mounted, auth state:", { 
      isAuthenticated, 
      isAdmin, 
      isDistributor, 
      sessionChecked 
    });
    
    // Only navigate if session check is complete to avoid premature redirects
    if (sessionChecked) {
      if (isAuthenticated) {
        // Use timeout to ensure auth state is stable before navigating
        setTimeout(() => {
          console.log("Navigating authenticated user to dashboard");
          navigate("/dashboard");
        }, 500);
      } else {
        console.log("Unauthenticated user, navigating to login");
        navigate("/login");
      }
    }
  }, [navigate, isAuthenticated, isAdmin, isDistributor, sessionChecked]);

  // Show loading indicator while waiting for session check
  if (!sessionChecked) {
    return <Loading text="Checking authentication status..." />;
  }

  return null;
};

export default Index;
