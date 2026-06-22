import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";

// Mirrors invoicing/serializers/invoice.py InvoiceCreateSerializer exactly —
// item quantity/unit_price min 0.01, due_date can't be in the past, at least
// one item is required.
const itemSchema = z.object({
  item_name: z.string().min(1, "Required").max(255),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Must be at least 0.01"),
  unit_price: z.number().min(0.01, "Must be at least 0.01"),
});

const schema = z.object({
  customer_name: z.string().min(1, "Required").max(255),
  customer_email: z.string().email("Enter a valid email address"),
  customer_phone: z.string().optional(),
  due_date: z
    .string()
    .min(1, "Required")
    .refine((v) => new Date(v) >= new Date(new Date().toDateString()), "Due date can't be in the past"),
  currency: z.string().min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "NGN",
      discount: 0,
      tax: 0,
      items: [{ item_name: "", description: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = watch("discount") ?? 0;
  const tax = watch("tax") ?? 0;
  const currency = watch("currency");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0),
    [items],
  );
  const total = subtotal - discount + tax;

  const onSubmit = async (values: FormValues) => {
    try {
      const invoice = await createInvoice.mutateAsync({
        ...values,
        customer_phone: values.customer_phone || undefined,
        notes: values.notes || undefined,
        terms: values.terms || undefined,
      });
      toast.success("Invoice created.");
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't create the invoice."),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">New invoice</h2>
        <p className="text-sm text-[var(--color-body)]">It saves as a draft until you send it.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
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
              <Label htmlFor="customer_phone">Customer phone (optional)</Label>
              <Input id="customer_phone" {...register("customer_phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
              {errors.due_date && <p className="text-xs text-[var(--color-status-overdue)]">{errors.due_date.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-[var(--radius-chip)] border border-[var(--color-line)] p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <div className="space-y-1.5">
                  <Label>Item</Label>
                  <Input placeholder="Web design services" {...register(`items.${index}.item_name`)} />
                  {errors.items?.[index]?.item_name && (
                    <p className="text-xs text-[var(--color-status-overdue)]">{errors.items[index]?.item_name?.message}</p>
                  )}
                </div>
                {/* <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input placeholder="Item description" {...register(`items.${index}.description`)} />
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-[var(--color-status-overdue)]">{errors.items[index]?.description?.message}</p>
                  )}
                </div> */}
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" step="0.01" min="0.01" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit price</Label>
                  <Input type="number" step="0.01" min="0.01" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.items?.message && <p className="text-xs text-[var(--color-status-overdue)]">{errors.items.message}</p>}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ item_name: "", description: "", quantity: 1, unit_price: 0 })}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals & notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
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
              <Label htmlFor="notes">Notes (visible to customer)</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea id="terms" {...register("terms")} />
            </div>
          </CardContent>
          <CardContent className="space-y-1 border-t border-[var(--color-line)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Subtotal</span>
              <span className="font-ledger">{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Discount</span>
              <span className="font-ledger">−{formatMoney(discount, currency)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Tax</span>
              <span className="font-ledger">+{formatMoney(tax, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-medium text-[var(--color-ink)]">
              <span>Total</span>
              <span className="font-ledger">{formatMoney(total, currency)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
