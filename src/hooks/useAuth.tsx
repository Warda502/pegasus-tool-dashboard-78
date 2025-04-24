
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "admin" | "user";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('email_type')
          .eq('id', session.user.id)
          .single();

        if (error || !userData) {
          console.error("Error fetching user role:", error);
          return;
        }

        const userRole = userData.email_type?.toLowerCase() as UserRole;
        setRole(userRole);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { role, loading };
};
