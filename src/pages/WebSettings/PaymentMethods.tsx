
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define Payment Method type
type PaymentMethod = {
  id: string;
  method: string;
  description: string | null;
  image_url: string | null;
};

// Form schema for payment method creation
const paymentMethodSchema = z.object({
  method: z.string().min(1, "Method name is required"),
  description: z.string().optional(),
  image_url: z.string().optional()
});

export default function PaymentMethods() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch payment methods
  const { data: paymentMethods = [], refetch } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("method", { ascending: true });
      
      if (error) {
        toast({
          title: t("fetchError"),
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as PaymentMethod[];
    },
  });

  // Form setup
  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method: "",
      description: "",
      image_url: ""
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .insert([
          {
            method: values.method,
            description: values.description || null,
            image_url: values.image_url || null
          }
        ]);

      if (error) throw error;
      
      toast({
        title: t("success"),
        description: t("paymentMethodAdded") || "Payment method added successfully",
      });
      
      form.reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("paymentMethods") || "Payment Methods"}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              {t("addNewMethod") || "Add New Method"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewMethod") || "Add New Method"}</DialogTitle>
              <DialogDescription>
                {t("addNewMethodDescription") || "Add a new payment method to your system"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("methodName") || "Method Name"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Credit Card, PayPal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description") || "Description"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the payment method..." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("imageURL") || "Image URL"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.png" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{t("add") || "Add"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("noPaymentMethodsFound") || "No payment methods found. Add your first payment method!"}
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4 flex-shrink-0">
                  {method.image_url ? (
                    <div className="h-24 flex items-center justify-center bg-muted rounded-md overflow-hidden">
                      <img 
                        src={method.image_url} 
                        alt={method.method} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-muted rounded-md">
                      <span className="text-muted-foreground">{t("noImage") || "No Image"}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{method.method}</h3>
                {method.description && (
                  <p className="text-sm text-muted-foreground flex-grow">{method.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
