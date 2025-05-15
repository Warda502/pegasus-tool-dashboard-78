
import { useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { DistributorDashboard } from "@/components/dashboard/DistributorDashboard";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { isAuthenticated, isAdmin, isDistributor, role, sessionChecked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionChecked && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  if (!isAuthenticated) {
    return null;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  if (isDistributor) {
    return <DistributorDashboard />;
  }

  return <UserDashboard />;
}
