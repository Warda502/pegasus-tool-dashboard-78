
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading } = useQuery({
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

  const editForm = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method: "",
      description: "",
      image_url: ""
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof paymentMethodSchema>) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: t("success"),
        description: t("paymentMethodAdded") || "Payment method added successfully",
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
    mutationFn: async (data: { id: string, values: z.infer<typeof paymentMethodSchema> }) => {
      const { error } = await supabase
        .from("payment_methods")
        .update({
          method: data.values.method,
          description: data.values.description || null,
          image_url: data.values.image_url || null
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: t("success"),
        description: t("paymentMethodUpdated") || "Payment method updated successfully",
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
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: t("success"),
        description: t("paymentMethodDeleted") || "Payment method deleted successfully",
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
  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    addMutation.mutate(values);
  };

  // Handle edit
  const handleEditClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    editForm.reset({
      method: method.method || "",
      description: method.description || "",
      image_url: method.image_url || ""
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof paymentMethodSchema>) => {
    if (!selectedMethod) return;
    updateMutation.mutate({ id: selectedMethod.id, values });
  };

  // Handle delete
  const handleDeleteClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedMethod) return;
    deleteMutation.mutate(selectedMethod.id);
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
        ) : paymentMethods.length === 0 ? (
          <Card className="col-span-full w-full max-w-md">
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("noPaymentMethodsFound") || "No payment methods found. Add your first payment method!"}
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="overflow-hidden w-full max-w-xs group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(method)}
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(method)}
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6 flex flex-col h-full">
                {method.image_url ? (
                  <div className="mb-4">
                    <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                      <img 
                        src={method.image_url} 
                        alt={method.method} 
                        className="h-full w-full object-contain"
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <div className="h-24 mb-4 flex items-center justify-center bg-muted rounded-md">
                    <span className="text-muted-foreground">{t("noImage") || "No Image"}</span>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{method.method}</h3>
                {method.description && (
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editMethod") || "Edit Payment Method"}</DialogTitle>
            <DialogDescription>
              {t("editMethodDescription") || "Update the payment method details"}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("methodName") || "Method Name"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description") || "Description"}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("imageURL") || "Image URL"}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
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
              {t("deleteMethodConfirmation") || "Are you sure you want to delete this payment method? This action cannot be undone."}
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
