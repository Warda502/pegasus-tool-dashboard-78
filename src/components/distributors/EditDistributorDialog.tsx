
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Distributor } from "@/hooks/data/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";

interface EditDistributorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: Distributor | null;
  onSave: (distributor: Partial<Distributor>) => Promise<boolean>;
}

export function EditDistributorDialog({
  isOpen,
  onClose,
  distributor,
  onSave,
}: EditDistributorDialogProps) {
  const { t } = useLanguage();
  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      country: "",
      website: "",
      facebook: "",
      commission_rate: "",
      permissions: "",
    },
  });

  useEffect(() => {
    if (distributor) {
      form.reset({
        name: distributor.user?.name || "",
        phone: distributor.user?.phone || "",
        country: distributor.user?.country || "",
        website: distributor.website || "",
        facebook: distributor.facebook || "",
        commission_rate: distributor.commission_rate || "",
        permissions: distributor.permissions || "",
      });
    }
  }, [distributor, form]);

  const onSubmit = async (data: any) => {
    if (!distributor) return;

    const updatedDistributor: Partial<Distributor> = {
      id: distributor.id,
      uid: distributor.uid,
      website: data.website,
      facebook: data.facebook,
      commission_rate: data.commission_rate,
      permissions: data.permissions,
      user: {
        name: data.name,
        phone: data.phone,
        country: data.country,
      },
    };

    const success = await onSave(updatedDistributor);
    if (success) {
      onClose();
    }
  };

  if (!distributor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t("editDistributor") || "Edit Distributor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name") || "Name"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t("phone") || "Phone"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("country") || "Country"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("website") || "Website"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("facebook") || "Facebook"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="username or URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("commissionRate") || "Commission Rate (%)"}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("permissions") || "Permissions"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="basic,premium,etc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button type="submit">
                {t("save") || "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
