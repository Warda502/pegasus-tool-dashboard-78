
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings2, User, Phone, KeyRound, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProfileFormValues {
  name: string;
  phone: string;
}

const EditMyProfile = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showHwidDialog, setShowHwidDialog] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      phone: ""
    }
  });
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            name: data.name || "",
            phone: data.phone || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast(t("error") || "Error", {
          description: t("errorFetchingProfile") || "Could not fetch your profile"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, form, t]);
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          name: values.name,
          phone: values.phone
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast(t("success") || "Success", {
        description: t("profileUpdated") || "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast(t("error") || "Error", {
        description: error instanceof Error ? error.message : t("errorUpdatingProfile") || "Could not update profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeHwid = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          hwid: 'Null'
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast(t("success") || "Success", {
        description: t("hwidReset") || "HWID reset successfully"
      });
      
      setShowHwidDialog(false);
    } catch (error) {
      console.error("Error resetting HWID:", error);
      toast(t("error") || "Error", {
        description: error instanceof Error ? error.message : t("errorResettingHwid") || "Could not reset HWID"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="container mx-auto py-6 max-w-3xl">
      <Card className="shadow-md">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>{t("editProfile") || "Edit Profile"}</CardTitle>
          </div>
          <CardDescription>
            {t("editProfileDescription") || "Update your personal information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="text-base sm:mb-0">{t("name") || "Name"}</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-background transition-colors focus:ring-1 focus:ring-primary" 
                            disabled={isLoading} 
                            placeholder={t("enterYourName") || "Enter your name"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="text-base sm:mb-0">{t("phone") || "Phone"}</FormLabel>
                        </div>
                        <FormControl>
                          <Input 
                            type="tel" 
                            {...field} 
                            className="bg-background transition-colors focus:ring-1 focus:ring-primary" 
                            disabled={isLoading} 
                            placeholder={t("enterYourPhone") || "Enter your phone number"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{t("deviceSettings") || "Device Settings"}</h3>
                  </div>
                  
                  <div className="rounded-lg bg-muted/40 p-4 text-sm">
                    <p className="text-muted-foreground mb-4">
                      {t("hwidDescription") || "This will reset your hardware ID, allowing you to use the application on a different device."}
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowHwidDialog(true)}
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <KeyRound className="h-4 w-4" />
                      {t("changeHwid") || "Reset Hardware ID"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="gap-2 min-w-[120px]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("saving") || "Saving..."}
                      </>
                    ) : (
                      t("saveChanges") || "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={showHwidDialog} onOpenChange={setShowHwidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmHwidReset") || "Confirm Reset"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("hwidResetWarning") || "Are you sure you want to reset your hardware ID? This will log you out from your current device."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeHwid} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("processing") || "Processing..."}
                </>
              ) : (
                t("confirm") || "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditMyProfile;
