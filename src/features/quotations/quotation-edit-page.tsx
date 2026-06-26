import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { useQuotationDetail, useUpdateQuotation } from "@/hooks/use-quotations";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";

const itemSchema = z.object({
  item_name:   z.string().min(1, "Required").max(255),
  description: z.string().optional(),
  quantity:    z.number().min(0.01, "Min 0.01"),
  unit_price:  z.number().min(0.01, "Min 0.01"),
});

const schema = z.object({
  customer_name:  z.string().min(1, "Required").max(255),
  customer_email: z.string().email("Enter a valid email"),
  customer_phone: z.string().optional(),
  expiry_date: z
    .string()
    .min(1, "Required")
    .refine((v) => new Date(v) > new Date(new Date().toDateString()), "Expiry must be in the future"),
  currency: z.string().min(1),
  discount: z.number().min(0).optional(),
  tax:      z.number().min(0).optional(),
  notes:    z.string().optional(),
  terms:    z.string().optional(),
  items:    z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

export function QuotationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quote, isLoading, isError, refetch } = useQuotationDetail(id);
  const updateQuotation = useUpdateQuotation();

  const defaultValues = useMemo<FormValues | undefined>(
    () =>
      quote
        ? {
            customer_name:  quote.customer_name,
            customer_email: quote.customer_email,
            customer_phone: quote.customer_phone ?? "",
            expiry_date:    quote.expiry_date.slice(0, 10),
            currency:       quote.currency,
            discount:       Number(quote.discount) || 0,
            tax:            Number(quote.tax) || 0,
            notes:          quote.notes ?? "",
            terms:          quote.terms ?? "",
            items: quote.items.map((i) => ({
              item_name:   i.item_name,
              description: i.description ?? "",
              quantity:    Number(i.quantity),
              unit_price:  Number(i.unit_price),
            })),
          }
        : undefined,
    [quote],
  );

  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items    = watch("items");
  const discount = watch("discount") ?? 0;
  const tax      = watch("tax") ?? 0;
  const currency = watch("currency");

  const subtotal = useMemo(
    () => (items ?? []).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0),
    [items],
  );
  const total = subtotal - Number(discount) + Number(tax);

  if (isLoading) return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (isError || !quote) return <ErrorState description="Couldn't load this quotation." onRetry={() => refetch()} />;

  if (!["draft", "sent"].includes(quote.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-[var(--color-body)]">
          This quotation is <strong>{quote.status}</strong> and can no longer be edited.
        </p>
        <Button variant="secondary" onClick={() => navigate(`/quotes/${quote.id}`)}>
          Back to quotation
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await updateQuotation.mutateAsync({
        id: quote.id,
        input: {
          ...values,
          customer_phone: values.customer_phone || undefined,
          notes:          values.notes || undefined,
          terms:          values.terms || undefined,
        },
      });
      toast.success("Quotation updated. Status reset to draft.");
      navigate(`/quotes/${quote.id}`);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update the quotation."));
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/quotes/${quote.id}`)}>
          <ChevronLeft className="size-4" />
        </Button>
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
            Edit {quote.quote_number}
          </h2>
          <p className="text-sm text-[var(--color-body)]">
            Saving will reset the status to draft so you can re-send.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3"><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Customer name</Label>
              <Input id="customer_name" {...register("customer_name")} />
              {errors.customer_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.customer_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Customer email</Label>
              <Input id="customer_email" type="email" {...register("customer_email")} />
              {errors.customer_email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.customer_email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Phone (optional)</Label>
              <Input id="customer_phone" {...register("customer_phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiry_date">Expiry date</Label>
              <Input id="expiry_date" type="date" {...register("expiry_date")} />
              {errors.expiry_date && <p className="text-xs text-[var(--color-status-overdue)]">{errors.expiry_date.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="pb-3"><CardTitle>Line items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-[var(--radius-chip)] border border-[var(--color-line)] p-3 sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:gap-3 sm:space-y-0">
                <div className="space-y-1.5 sm:col-span-4">
                  <Label>Item</Label>
                  <Input {...register(`items.${index}.item_name`)} />
                  {errors.items?.[index]?.item_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.items[index]?.item_name?.message}</p>}
                </div>
                <div className="space-y-1.5 sm:col-span-4">
                  <Label>Description</Label>
                  <Textarea rows={2} className="resize-y" {...register(`items.${index}.description`)} />
                </div>
                <div className="flex gap-3 sm:contents">
                  <div className="flex-1 space-y-1.5 sm:flex-none">
                    <Label>Qty</Label>
                    <Input type="number" step="0.01" min="0.01" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div className="flex-1 space-y-1.5 sm:flex-none">
                    <Label>Unit price</Label>
                    <Input type="number" step="0.01" min="0.01" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {errors.items?.message && <p className="text-xs text-[var(--color-status-overdue)]">{errors.items.message}</p>}
            <Button type="button" variant="secondary" size="sm"
              onClick={() => append({ item_name: "", description: "", quantity: 1, unit_price: 0 })}>
              <Plus className="size-4" />Add item
            </Button>
          </CardContent>
        </Card>

        {/* Totals & notes */}
        <Card>
          <CardHeader className="pb-3"><CardTitle>Totals & notes</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN — Naira</SelectItem>
                  <SelectItem value="USD">USD — Dollar</SelectItem>
                  <SelectItem value="GBP">GBP — Pound</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />
            <div className="space-y-1.5">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" type="number" step="0.01" min="0" {...register("discount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" step="0.01" min="0" {...register("tax", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea id="terms" {...register("terms")} />
            </div>
          </CardContent>

          {/* Live totals */}
          <CardContent className="space-y-1 border-t border-[var(--color-line)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-body)]"><span>Subtotal</span><span className="font-ledger">{formatMoney(subtotal, currency)}</span></div>
            <div className="flex justify-between text-[var(--color-body)]"><span>Discount</span><span className="font-ledger">−{formatMoney(Number(discount), currency)}</span></div>
            <div className="flex justify-between text-[var(--color-body)]"><span>Tax</span><span className="font-ledger">+{formatMoney(Number(tax), currency)}</span></div>
            <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-medium text-[var(--color-ink)]">
              <span>Total</span><span className="font-ledger">{formatMoney(total, currency)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(`/quotes/${quote.id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="size-4 animate-spin" />Saving…</> : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
