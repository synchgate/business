import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordManualPayment } from "@/hooks/use-payments";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { formatMoney } from "@/lib/format";
import { MANUAL_PAYMENT_METHODS, type PaymentMethod } from "@/types/payment";
import type { InvoiceDetail } from "@/types/invoice";

const schema = z.object({
  amount_paid: z
    .number()
    .min(0.01, "Must be at least 0.01"),
  payment_method: z.enum([
    "bank_transfer",
    "virtual_account",
    "cash",
    "cheque",
    "other",
  ]),
  reference: z.string().optional(),
  note: z.string().max(500).optional(),
  paid_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoice,
}: RecordPaymentDialogProps) {
  const recordPayment = useRecordManualPayment(invoice.id);

  const remaining =
    Number(invoice.total_amount) - Number(invoice.amount_paid);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: "bank_transfer",
      amount_paid: remaining,
      paid_at: new Date().toISOString().slice(0, 10),
    },
  });

  const amountValue = watch("amount_paid") ?? 0;
  const willBeFullyPaid = amountValue >= remaining;

  const onSubmit = async (values: FormValues) => {
    try {
      await recordPayment.mutateAsync({
        amount_paid: values.amount_paid,
        payment_method: values.payment_method,
        reference: values.reference || undefined,
        note: values.note || undefined,
        paid_at: values.paid_at
          ? new Date(values.paid_at).toISOString()
          : undefined,
      });
      toast.success(
        willBeFullyPaid
          ? "Payment recorded — invoice marked as paid."
          : "Partial payment recorded.",
      );
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't record the payment.",
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Record a payment received outside Paystack — bank transfer, cash,
            or virtual account deposit.
          </DialogDescription>
        </DialogHeader>

        {/* Outstanding balance pill */}
        <div className="rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-body)]">Invoice total</span>
            <span className="font-ledger text-[var(--color-ink)]">
              {formatMoney(invoice.total_amount, invoice.currency)}
            </span>
          </div>
          {Number(invoice.amount_paid) > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-[var(--color-body)]">Already paid</span>
              <span className="font-ledger text-[var(--color-status-paid)]">
                {formatMoney(invoice.amount_paid, invoice.currency)}
              </span>
            </div>
          )}
          <div className="mt-1 border-t border-[var(--color-line)] pt-1 flex items-center justify-between font-medium">
            <span className="text-[var(--color-ink)]">Outstanding</span>
            <span className="font-ledger text-[var(--color-ink)]">
              {formatMoney(remaining, invoice.currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="rp_amount">Amount received</Label>
            <Input
              id="rp_amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              {...register("amount_paid", { valueAsNumber: true })}
            />
            {errors.amount_paid && (
              <p className="text-xs text-[var(--color-status-overdue)]">
                {errors.amount_paid.message}
              </p>
            )}
            {amountValue > 0 && amountValue < remaining && (
              <p className="text-xs text-[var(--color-status-partially_paid)]">
                Partial payment — {formatMoney(remaining - amountValue, invoice.currency)} will
                remain outstanding.
              </p>
            )}
            {willBeFullyPaid && amountValue > 0 && (
              <p className="text-xs text-[var(--color-status-paid)]">
                This will mark the invoice as fully paid.
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select
              defaultValue="bank_transfer"
              onValueChange={(v) =>
                setValue("payment_method", v as PaymentMethod)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="rp_date">Payment date</Label>
            <Input id="rp_date" type="date" {...register("paid_at")} />
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="rp_ref">
              Reference{" "}
              <span className="text-[var(--color-muted)]">(optional)</span>
            </Label>
            <Input
              id="rp_ref"
              placeholder="e.g. TRF-0023441"
              {...register("reference")}
            />
            <p className="text-xs text-[var(--color-muted)]">
              Auto-generated if left blank.
            </p>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="rp_note">
              Note <span className="text-[var(--color-muted)]">(optional)</span>
            </Label>
            <Textarea
              id="rp_note"
              placeholder="e.g. Customer paid half now, rest next week"
              rows={2}
              {...register("note")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || recordPayment.isPending}>
              {recordPayment.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Recording…
                </>
              ) : (
                "Record payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
