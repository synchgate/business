import {
  CreditCard,
  Building2,
  Banknote,
  BookOpen,
  HelpCircle,
  Landmark,
  Bot,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoicePayments } from "@/hooks/use-payments";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { InvoicePayment } from "@/types/payment";

const METHOD_META: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  card: { label: "Card", icon: CreditCard },
  bank_transfer: { label: "Bank transfer", icon: Landmark },
  virtual_account: { label: "Virtual account", icon: Building2 },
  cash: { label: "Cash", icon: Banknote },
  cheque: { label: "Cheque", icon: BookOpen },
  ussd: { label: "USSD", icon: HelpCircle },
  other: { label: "Other", icon: HelpCircle },
};

function PaymentRow({ payment, currency }: { payment: InvoicePayment; currency: string }) {
  const meta = METHOD_META[payment.payment_method] ?? METHOD_META.other;
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-4 py-3">
      {/* Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
        <Icon className="size-4 text-[var(--color-body)]" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {meta.label}
            </p>
            {payment.is_manual ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
                <User className="size-2.5" />
                Manual
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                <Bot className="size-2.5" />
                Paystack
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {formatDateTime(payment.paid_at)}
          </p>
          {payment.reference && (
            <p className="font-ledger text-xs text-[var(--color-muted)]">
              Ref: {payment.reference}
            </p>
          )}
          {(payment.metadata as { note?: string })?.note && (
            <p className="text-xs italic text-[var(--color-body)]">
              "{(payment.metadata as { note: string }).note}"
            </p>
          )}
          <p className="text-xs text-[var(--color-muted)]">
            Recorded by {payment.recorded_by_name}
          </p>
        </div>

        <p className="font-ledger text-base font-semibold text-[var(--color-status-paid)]">
          +{formatMoney(payment.amount_paid, currency)}
        </p>
      </div>
    </div>
  );
}

interface PaymentHistoryProps {
  invoiceId: string;
  currency: string;
}

export function PaymentHistory({ invoiceId, currency }: PaymentHistoryProps) {
  const { data: payments, isLoading } = useInvoicePayments(invoiceId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) return null;

  const total = payments.reduce(
    (sum, p) => sum + Number(p.amount_paid),
    0,
  );

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Payment history</CardTitle>
          <span className="font-ledger text-sm font-semibold text-[var(--color-status-paid)]">
            {formatMoney(total, currency)} received
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-[var(--color-line)]">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} currency={currency} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
