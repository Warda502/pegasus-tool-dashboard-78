
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Schema for password step
const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Schema for email step (when not coming from recovery link)
const emailSchema = z.object({
  email: z.string().email(),
});

const ChangeMyPassword = () => {
  const { t, isRTL } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectPasswordReset, setIsDirectPasswordReset] = useState(false);
  const [email, setEmail] = useState("");
  
  // Form for password change
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    }
  });
  
  // Form for email verification request
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    }
  });

  // Check if we're coming from a password recovery link
  useEffect(() => {
    const checkForRecoverySession = async () => {
      // Try to get the session from the URL
      try {
        // If we have both type=recovery and access_token or refresh_token in the URL,
        // we can directly show the password change form
        const type = searchParams.get("type");
        
        if (type === "recovery") {
          console.log("Coming from recovery link");
          setIsDirectPasswordReset(true);
          
          // Try to extract email from the recovery session
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session) {
            setEmail(data.session.user.email || "");
          }
        }
      } catch (error) {
        console.error("Error checking for recovery session:", error);
      }
    };
    
    checkForRecoverySession();
  }, [searchParams]);

  // Request a password reset link
  const onRequestResetLink = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true);
      setEmail(values.email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        { redirectTo: window.location.origin + '/change-password?type=recovery' }
      );
      
      if (error) throw error;
      
      toast(t("resetLinkSent"), {
        description: t("checkYourEmail")
      });
      
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("errorRequestingReset")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change Password
  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setIsLoading(true);
      
      // Update the password using the current session
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) throw error;
      
      toast(t("passwordUpdated"), {
        description: t("loginWithNewPassword")
      });
      
      // Log user out and redirect to login page
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error changing password:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("errorChangingPassword")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the appropriate form based on whether we're coming from a recovery link
  const renderContent = () => {
    if (isDirectPasswordReset) {
      return (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t("updating") : t("updatePassword")}
            </Button>
          </form>
        </Form>
      );
    } else {
      return (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onRequestResetLink)} className="space-y-6">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t("sending") : t("sendResetLink")}
            </Button>
          </form>
        </Form>
      );
    }
  };
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
          <CardDescription>
            {isDirectPasswordReset ? 
              t("enterNewPasswordDescription") : 
              t("requestResetLinkDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeMyPassword;
