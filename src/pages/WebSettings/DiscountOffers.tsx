
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// Define Offer type
type Offer = {
  id: string;
  percentage: string | null;
  period: string | null;
  expiry_at: string | null;
  created_at: string;
};

// Form schema for discount offer creation
const discountOfferSchema = z.object({
  percentage: z.string().min(1, "Percentage is required"),
  period: z.string().optional(),
  expiry_at: z.string().optional()
});

export default function DiscountOffers() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch discount offers
  const { data: discountOffers = [], refetch } = useQuery({
    queryKey: ["discountOffers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: t("fetchError"),
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Offer[];
    },
  });

  // Form setup
  const form = useForm<z.infer<typeof discountOfferSchema>>({
    resolver: zodResolver(discountOfferSchema),
    defaultValues: {
      percentage: "",
      period: "",
      expiry_at: ""
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof discountOfferSchema>) => {
    try {
      const { error } = await supabase
        .from("offers")
        .insert([
          {
            percentage: values.percentage,
            period: values.period || null,
            expiry_at: values.expiry_at ? new Date(values.expiry_at).toISOString() : null
          }
        ]);

      if (error) throw error;
      
      toast({
        title: t("success"),
        description: t("discountOfferAdded") || "Discount offer added successfully",
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

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("noExpiryDate") || "No expiry date";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("discountOffers") || "Discount Offers"}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              {t("addNewOffer") || "Add New Offer"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewOffer") || "Add New Offer"}</DialogTitle>
              <DialogDescription>
                {t("addNewOfferDescription") || "Create a new discount offer for your customers"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("discountPercentage") || "Discount Percentage"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("period") || "Period"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Summer Sale, New Year Special" 
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
                  name="expiry_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("expiryDate") || "Expiry Date"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
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
        {discountOffers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("noDiscountOffersFound") || "No discount offers found. Create your first offer!"}
            </CardContent>
          </Card>
        ) : (
          discountOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <Percent className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">{offer.percentage}</h3>
                  {offer.period && (
                    <p className="text-lg font-medium">{offer.period}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {offer.expiry_at && (
                      <>
                        <span className="font-medium">{t("expiresOn") || "Expires on"}:</span> {formatDate(offer.expiry_at)}
                      </>
                    )}
                    {!offer.expiry_at && (
                      <span>{t("noExpiryDate") || "No expiry date"}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("createdOn") || "Created on"}: {format(new Date(offer.created_at), "PPP")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
