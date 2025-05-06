
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
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
import { Settings2 } from "lucide-react";

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
        toast(t("error"), {
          description: t("errorFetchingProfile")
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
      
      toast(t("success"), {
        description: t("profileUpdated")
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("errorUpdatingProfile")
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
      
      toast(t("success"), {
        description: t("hwidReset")
      });
      
      setShowHwidDialog(false);
    } catch (error) {
      console.error("Error resetting HWID:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("errorResettingHwid")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="container mx-auto py-6 max-w-2xl">
      <Card className="shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <CardTitle>{t("editProfile")}</CardTitle>
          </div>
          <CardDescription>
            {t("editProfile")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background" disabled={isLoading} />
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
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} className="bg-background" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <Button type="submit" className="gap-2" disabled={isLoading}>
                  {isLoading ? t("saving") : t("saveChanges")}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowHwidDialog(true)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  {t("changeHwid")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showHwidDialog} onOpenChange={setShowHwidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmHwidReset")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("hwidResetWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeHwid}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditMyProfile;

