
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Percent, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useOffers } from "@/hooks/useDiscounts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Define Offer type
type Offer = {
  id: string;
  percentage: string | null;
  status: string | null;
  expiry_at: string | null;
  created_at: string;
};

// Form schema for discount offer creation
const discountOfferSchema = z.object({
  percentage: z.string().min(1, "Percentage is required"),
  status: z.string().optional(),
  expiry_at: z.string().optional()
});

export default function DiscountOffers() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Fetch discount offers using our new hook
  const { data: discountOffers = [], isLoading } = useOffers();

  // Form setup
  const form = useForm<z.infer<typeof discountOfferSchema>>({
    resolver: zodResolver(discountOfferSchema),
    defaultValues: {
      percentage: "",
      status: "",
      expiry_at: ""
    },
  });

  const editForm = useForm<z.infer<typeof discountOfferSchema>>({
    resolver: zodResolver(discountOfferSchema),
    defaultValues: {
      percentage: "",
      status: "",
      expiry_at: ""
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof discountOfferSchema>) => {
      const { error } = await supabase
        .from("offers")
        .insert([
          {
            percentage: values.percentage,
            status: values.status || null,
            expiry_at: values.expiry_at ? new Date(values.expiry_at).toISOString() : null
          }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast({
        title: t("success"),
        description: t("discountOfferAdded") || "Discount offer added successfully",
      });
      
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string, values: z.infer<typeof discountOfferSchema> }) => {
      const { error } = await supabase
        .from("offers")
        .update({
          percentage: data.values.percentage,
          status: data.values.status || null,
          expiry_at: data.values.expiry_at ? new Date(data.values.expiry_at).toISOString() : null
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast({
        title: t("success"),
        description: t("discountOfferUpdated") || "Discount offer updated successfully",
      });
      
      editForm.reset();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast({
        title: t("success"),
        description: t("discountOfferDeleted") || "Discount offer deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof discountOfferSchema>) => {
    addMutation.mutate(values);
  };

  // Handle edit
  const handleEditClick = (offer: Offer) => {
    setSelectedOffer(offer);
    editForm.reset({
      percentage: offer.percentage || "",
      status: offer.status || "",
      expiry_at: offer.expiry_at ? offer.expiry_at.split('T')[0] : ""
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof discountOfferSchema>) => {
    if (!selectedOffer) return;
    updateMutation.mutate({ id: selectedOffer.id, values });
  };

  // Handle delete
  const handleDeleteClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedOffer) return;
    deleteMutation.mutate(selectedOffer.id);
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

  // Check if an offer is expired
  const isOfferExpired = (offer: Offer) => {
    return offer.status === "expired";
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("status") || "Status"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. active, special" 
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
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? t("adding") || "Adding..." : t("add") || "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : discountOffers.length === 0 ? (
          <Card className="col-span-full w-full max-w-md">
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("noDiscountOffersFound") || "No discount offers found. Create your first offer!"}
            </CardContent>
          </Card>
        ) : (
          discountOffers.map((offer) => (
            <Card 
              key={offer.id} 
              className={`overflow-hidden w-full max-w-xs group relative ${
                isOfferExpired(offer) ? "border-destructive/30 bg-destructive/5" : "hover:shadow-md"
              } transition-all duration-300`}
            >
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(offer)}
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(offer)}
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <Percent className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">{offer.percentage}</h3>
                  {offer.status && (
                    <p className={`text-sm font-medium inline-flex px-2 py-1 rounded-full ${
                      isOfferExpired(offer) ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>
                      {isOfferExpired(offer) ? t("expired") || "Expired" : offer.status}
                    </p>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editOffer") || "Edit Offer"}</DialogTitle>
            <DialogDescription>
              {t("editOfferDescription") || "Update the discount offer details"}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("status") || "Status"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. active, special" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t("cancel") || "Cancel"}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t("saving") || "Saving..." : t("save") || "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteOfferConfirmation") || "Are you sure you want to delete this offer? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? t("deleting") || "Deleting..." : t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
