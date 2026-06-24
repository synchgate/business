import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, User, ChevronDown, Loader2, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { useAllCustomers, useCustomer } from "@/hooks/use-customers";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

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
    .refine(
      (v) => new Date(v) >= new Date(new Date().toDateString()),
      "Due date can't be in the past",
    ),
  currency: z.string().min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

// ── Customer picker ────────────────────────────────────────────────
function CustomerPicker({
  onSelect,
  selectedId,
}: {
  onSelect: (c: { id: string; name: string; email: string; phone?: string }) => void;
  selectedId: string | null;
}) {
  const { data: customers = [], isLoading } = useAllCustomers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.business_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-sm outline-none transition-colors hover:border-[var(--color-primary)]",
          open && "border-[var(--color-primary)]",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 text-[var(--color-ink)]">
          <User className="size-3.5 shrink-0 text-[var(--color-muted)]" />
          <span className="truncate">
            {isLoading
              ? "Loading customers…"
              : selected
              ? `${selected.name} · ${selected.email}`
              : "Select existing customer (optional)"}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-[var(--color-muted)]" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg">
          <div className="p-2">
            <Input
              autoFocus
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-4 animate-spin text-[var(--color-muted)]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-[var(--color-muted)]">No customers found</p>
            ) : (
              filtered.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-muted)]"
                  onClick={() => {
                    onSelect({ id: c.id, name: c.business_name ?? c.name, email: c.email, phone: c.phone ?? undefined });
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <User className="mt-0.5 size-3.5 shrink-0 text-[var(--color-muted)]" />
                  <span className="min-w-0">
                    <span className="font-medium text-[var(--color-ink)]">{c.business_name ?? c.name}</span>
                    <span className="ml-1.5 text-xs text-[var(--color-muted)] truncate">{c.email}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          {selected && (
            <div className="border-t border-[var(--color-line)] p-2">
              <button
                type="button"
                className="w-full rounded-[var(--radius-chip)] py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
                onClick={() => { onSelect({ id: "", name: "", email: "", phone: "" }); setOpen(false); }}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get("customer");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(preselectedCustomerId);

  const createInvoice = useCreateInvoice();
  const { data: preloadedCustomer } = useCustomer(preselectedCustomerId ?? undefined);

  const {
    register, control, handleSubmit, watch, setValue,
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

  useEffect(() => {
    if (preloadedCustomer) {
      setValue("customer_name", preloadedCustomer.business_name ?? preloadedCustomer.name);
      setValue("customer_email", preloadedCustomer.email);
      setValue("customer_phone", preloadedCustomer.phone ?? "");
    }
  }, [preloadedCustomer, setValue]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = watch("discount") ?? 0;
  const tax = watch("tax") ?? 0;
  const currency = watch("currency");

  const subtotal = useMemo(
    () => (items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0),
    [items],
  );
  const total = subtotal - Number(discount) + Number(tax);

  const handleCustomerSelect = (c: { id: string; name: string; email: string; phone?: string }) => {
    setSelectedCustomerId(c.id || null);
    if (c.name) setValue("customer_name", c.name);
    if (c.email) setValue("customer_email", c.email);
    if (c.phone !== undefined) setValue("customer_phone", c.phone);
  };

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
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't create the invoice."));
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">New invoice</h2>
          <p className="text-sm text-[var(--color-body)]">Saves as a draft until you send it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select from directory (optional)</Label>
              <CustomerPicker selectedId={selectedCustomerId} onSelect={handleCustomerSelect} />
              <p className="text-xs text-[var(--color-muted)]">
                Selecting a customer fills in their details automatically.{" "}
                <a href="/customers" className="text-[var(--color-primary)] hover:underline">Manage customers →</a>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">Customer name</Label>
                <Input id="customer_name" {...register("customer_name")} />
                {errors.customer_name && (
                  <p className="text-xs text-[var(--color-status-overdue)]">{errors.customer_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_email">Customer email</Label>
                <Input id="customer_email" type="email" {...register("customer_email")} />
                {errors.customer_email && (
                  <p className="text-xs text-[var(--color-status-overdue)]">{errors.customer_email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_phone">Phone (optional)</Label>
                <Input id="customer_phone" {...register("customer_phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_date">Due date</Label>
                <Input id="due_date" type="date" {...register("due_date")} />
                {errors.due_date && (
                  <p className="text-xs text-[var(--color-status-overdue)]">{errors.due_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-3 rounded-[var(--radius-chip)] border border-[var(--color-line)] p-3 sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:gap-3 sm:space-y-0"
              >
                {/* Item name */}
                <div className="space-y-1.5 sm:col-span-4 sm:col-start-1">
                  <Label>Item</Label>
                  <Input placeholder="Web design services" {...register(`items.${index}.item_name`)} />
                  {errors.items?.[index]?.item_name && (
                    <p className="text-xs text-[var(--color-status-overdue)]">{errors.items[index]?.item_name?.message}</p>
                  )}
                </div>
                {/* Description */}
                <div className="space-y-1.5 sm:col-span-4">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Item description"
                    rows={2}
                    className="resize-y"
                    {...register(`items.${index}.description`)}
                  />
                </div>
                {/* Qty + price + delete */}
                <div className="flex gap-3 sm:contents">
                  <div className="flex-1 space-y-1.5 sm:flex-none">
                    <Label>Qty</Label>
                    <Input
                      type="number" step="0.01" min="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 sm:flex-none">
                    <Label>Unit price</Label>
                    <Input
                      type="number" step="0.01" min="0.01"
                      {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-end sm:flex-none">
                    <Button
                      type="button" variant="ghost" size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {errors.items?.message && (
              <p className="text-xs text-[var(--color-status-overdue)]">{errors.items.message}</p>
            )}
            <Button
              type="button" variant="secondary" size="sm"
              onClick={() => append({ item_name: "", description: "", quantity: 1, unit_price: 0 })}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </CardContent>
        </Card>

        {/* Totals & notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Totals & notes</CardTitle>
          </CardHeader>
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
              <Label htmlFor="notes">Notes (visible to customer)</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea id="terms" {...register("terms")} />
            </div>
          </CardContent>

          {/* Live total */}
          <CardContent className="space-y-1 border-t border-[var(--color-line)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Subtotal</span>
              <span className="font-ledger">{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Discount</span>
              <span className="font-ledger">−{formatMoney(Number(discount), currency)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-body)]">
              <span>Tax</span>
              <span className="font-ledger">+{formatMoney(Number(tax), currency)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-medium text-[var(--color-ink)]">
              <span>Total</span>
              <span className="font-ledger">{formatMoney(total, currency)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" />Saving…</>
            ) : (
              "Save invoice"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
