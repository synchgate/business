import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { getPublicInvoice } from "@/api/endpoints/invoices";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { formatDate, formatMoney } from "@/lib/format";

export function PublicInvoicePage() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["public", "invoice", invoiceNumber],
    queryFn: () => getPublicInvoice(invoiceNumber as string),
    enabled: !!invoiceNumber,
    retry: false,
  });

  return (
    <div className="flex min-h-screen justify-center bg-[var(--color-canvas)] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : isError || !invoice ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <ErrorState title="Invoice not found" description="This invoice link may be invalid or expired." />
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-ledger text-lg font-medium text-[var(--color-ink)]">{invoice.invoice_number}</p>
                <p className="text-sm text-[var(--color-body)]">Due {formatDate(invoice.due_date)}</p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            <div className="mt-6 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-[var(--color-body)]">Amount due</p>
              <p className="font-ledger text-3xl font-medium text-[var(--color-ink)]">
                {formatMoney(Number(invoice.total_amount) - Number(invoice.amount_paid), invoice.currency)}
              </p>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex justify-between text-[var(--color-body)]">
                  <span>
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-ledger">{formatMoney(item.amount, invoice.currency)}</span>
                </div>
              ))}
            </div>

            {invoice.status === "paid" ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-[color-mix(in_srgb,var(--color-status-paid)_12%,transparent)] py-3 text-sm font-medium text-[var(--color-status-paid)]">
                <CheckCircle2 className="size-4" />
                Paid in full
              </div>
            ) : invoice.payment_link ? (
              <Button asChild className="mt-6 w-full" size="lg">
                <a href={invoice.payment_link} target="_blank" rel="noreferrer">
                  Pay now
                </a>
              </Button>
            ) : (
              <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
                Payment isn't available for this invoice yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
