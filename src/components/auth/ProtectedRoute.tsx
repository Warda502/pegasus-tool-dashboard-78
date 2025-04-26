
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, isAuthenticated, sessionChecked, handleSessionExpired } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // التحقق من صلاحية الجلسة عند كل تحميل للمسار المحمي
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          handleSessionExpired();
          return;
        }
        
        if (!data.session) {
          console.log("ProtectedRoute: No active session found");
          if (isAuthenticated) {
            // تعارض في الحالة - المستخدم متوقع أن يكون مسجل دخوله ولكن لا توجد جلسة
            handleSessionExpired();
            return;
          }
          
          // تجنب إعادة التوجيه المتكرر
          if (window.location.pathname !== '/login') {
            navigate("/login");
          }
          return;
        }
        
        // هنا يمكن فحص انتهاء صلاحية الجلسة أيضًا إذا لزم الأمر
        const currentTime = Math.floor(Date.now() / 1000);
        if (data.session.expires_at && data.session.expires_at < currentTime) {
          console.log("Session expired, redirecting to login");
          handleSessionExpired();
          return;
        }
        
        setIsChecking(false);
      } catch (err) {
        console.error("Error in checkSession:", err);
        setIsChecking(false);
      }
    };

    if (sessionChecked) {
      checkSession();
    }
  }, [sessionChecked, navigate, handleSessionExpired, isAuthenticated, t]);

  useEffect(() => {
    let redirectTimeout: number | null = null;
    
    if (!loading && sessionChecked && !isChecking) {
      if (!isAuthenticated) {
        // تجنب عرض رسائل متكررة والتوجيه المستمر
        if (window.location.pathname !== '/login') {
          redirectTimeout = window.setTimeout(() => {
            navigate("/login");
          }, 100);
        }
      } else if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
        toast(t("accessDenied"), {
          description: t("noPermission")
        });
        redirectTimeout = window.setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      }
    }
    
    return () => {
      if (redirectTimeout) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [role, loading, navigate, allowedRoles, t, isAuthenticated, sessionChecked, isChecking]);

  if (loading || isChecking) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-700">{t("loading")}</p>
      </div>
    </div>;
  }

  return <>{children}</>;
};
