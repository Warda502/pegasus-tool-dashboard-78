
import { useState } from "react";
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
  Textarea,
} from "@/components/ui";

const creditsSchema = z.object({
  amount: z.number()
    .refine(val => val !== 0, { message: "Amount cannot be zero" }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof creditsSchema>;

interface AddCreditsDialogProps {
  distributor: Distributor;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddCreditsDialog({
  distributor,
  children,
  onSuccess,
}: AddCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { addCredits, loading } = useDistributors();

  const form = useForm<FormData>({
    resolver: zodResolver(creditsSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  });

  const onSubmit = (data: FormData) => {
    addCredits(
      {
        distributorId: distributor.id,
        data: {
          amount: data.amount,
          notes: data.notes,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('manageCredits')}</DialogTitle>
          <DialogDescription>
            {t('manageCreditsDescription', { name: distributor.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="font-medium">{t('currentBalance')}</p>
          <div className="text-2xl font-bold">{distributor.credits_balance.toFixed(1)}</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('amountDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('notesDescription')}
                  </FormDescription>
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
                {loading ? t('processing') : t('updateCredits')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
