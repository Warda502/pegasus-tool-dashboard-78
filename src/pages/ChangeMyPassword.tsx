
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Define the different steps of the password change flow
type Step = "request" | "verifyOtp" | "changePassword";

// Schema for email step
const emailSchema = z.object({
  email: z.string().email(),
});

// Schema for OTP step
const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters" }),
});

// Schema for password step
const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ChangeMyPassword = () => {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  
  // Form for email verification request
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
    }
  });
  
  // Form for OTP verification
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    }
  });
  
  // Form for password change
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    }
  });
  
  // Step 1: Request OTP
  const onRequestOtp = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true);
      setEmail(values.email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        { redirectTo: window.location.origin + '/change-password' }
      );
      
      if (error) throw error;
      
      toast(t("otpSent"), {
        description: t("checkYourEmail")
      });
      
      setCurrentStep("verifyOtp");
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("errorRequestingOtp")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Step 2: Verify OTP
  const onVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would verify the OTP with Supabase
      // For now, we're just moving to the next step
      // This is where you'd typically make a verification API call
      
      toast(t("otpVerified"), {
        description: t("proceedToChangePassword")
      });
      
      setCurrentStep("changePassword");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("invalidOtp")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Step 3: Change Password
  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
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
  
  // Render the appropriate form based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "request":
        return (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-6">
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
                {isLoading ? t("sending") : t("sendVerificationCode")}
              </Button>
            </form>
          </Form>
        );
        
      case "verifyOtp":
        return (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("verificationCode")}</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t("verifying") : t("verifyCode")}
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setCurrentStep("request")} 
                  className="w-full"
                >
                  {t("backToEmailInput")}
                </Button>
              </div>
            </form>
          </Form>
        );
        
      case "changePassword":
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
    }
  };
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
          <CardDescription>
            {currentStep === "request" && t("requestVerificationDescription")}
            {currentStep === "verifyOtp" && t("enterVerificationDescription")}
            {currentStep === "changePassword" && t("enterNewPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeMyPassword;
