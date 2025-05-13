
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/hooks/useLanguage";
import { useDistributors } from "@/hooks/useDistributors";
import type { Distributor } from "@/hooks/data/types/distributors";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "es", label: "Spain" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "mx", label: "Mexico" },
  { value: "ae", label: "UAE" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "eg", label: "Egypt" },
];

const distributorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  commission_rate: z.number()
    .min(0, "Commission rate must be positive")
    .max(100, "Commission rate cannot exceed 100%"),
  max_credit_limit: z.number()
    .min(0, "Credit limit must be positive"),
  status: z.enum(["active", "inactive"]),
});

type FormData = z.infer<typeof distributorSchema>;

interface EditDistributorDialogProps {
  distributor: Distributor;
  children?: React.ReactNode;
  onEditSuccess?: () => void;
}

export function EditDistributorDialog({
  distributor,
  children,
  onEditSuccess,
}: EditDistributorDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { updateDistributor, loading } = useDistributors();

  const form = useForm<FormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: distributor.name,
      email: distributor.email,
      phone: distributor.phone || "",
      country: distributor.country || "",
      commission_rate: distributor.commission_rate,
      max_credit_limit: distributor.max_credit_limit,
      status: distributor.status as "active" | "inactive",
    },
  });

  useEffect(() => {
    if (open) {
      // Reset form with distributor values when dialog opens
      form.reset({
        name: distributor.name,
        email: distributor.email,
        phone: distributor.phone || "",
        country: distributor.country || "",
        commission_rate: distributor.commission_rate,
        max_credit_limit: distributor.max_credit_limit,
        status: distributor.status as "active" | "inactive",
      });
    }
  }, [distributor, form, open]);

  const onSubmit = (data: FormData) => {
    updateDistributor(
      {
        id: distributor.id,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          commission_rate: data.commission_rate,
          max_credit_limit: data.max_credit_limit,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          if (onEditSuccess) onEditSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editDistributor')}</DialogTitle>
          <DialogDescription>
            {t('editDistributorDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('distributorName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectCountry')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('commissionRate')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('commissionRateDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maxCreditLimit')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('maxCreditLimitDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
