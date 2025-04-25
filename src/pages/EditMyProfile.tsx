
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormValues {
  name: string;
  email: string;
}

const EditMyProfile = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      email: ""
    }
  });
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            name: data.name || "",
            email: data.email || ""
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
          email: values.email
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
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("editProfile")}</CardTitle>
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
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("saveChanges")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMyProfile;
