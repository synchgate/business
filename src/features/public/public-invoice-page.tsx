import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { getPublicInvoice } from "@/api/endpoints/invoices";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/components/ui/toaster";

export function PublicInvoicePage() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["public", "invoice", invoiceNumber],
    queryFn: () => getPublicInvoice(invoiceNumber as string),
    enabled: !!invoiceNumber,
    retry: false,
  });

  const amountDue = invoice
    ? Number(invoice.total_amount) - Number(invoice.amount_paid)
    : 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      {/* Nav bar */}
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <Copy className="size-3.5" />
            Copy link
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-lg">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !invoice ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <ErrorState
                title="Invoice not found"
                description="This invoice link may be invalid or expired."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main invoice card */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
                  <div>
                    <p className="font-ledger text-base font-medium text-[var(--color-ink)] sm:text-lg">
                      {invoice.invoice_number.split("-").slice(0, 3).join("-")}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--color-body)]">
                      Due {formatDate(invoice.due_date)}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>

                {/* Amount due */}
                <div className="mx-4 mb-4 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] p-4 sm:mx-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    {invoice.status === "paid" ? "Total paid" : "Amount due"}
                  </p>
                  <p className="mt-1 font-ledger text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
                    {formatMoney(
                      invoice.status === "paid" ? invoice.total_amount : amountDue,
                      invoice.currency,
                    )}
                  </p>
                  {Number(invoice.amount_paid) > 0 && invoice.status !== "paid" && (
                    <p className="mt-1 text-xs text-[var(--color-status-paid)]">
                      {formatMoney(invoice.amount_paid, invoice.currency)} already paid
                    </p>
                  )}
                </div>

                <Separator />

                {/* Billed to */}
                <div className="p-4 sm:p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Billed to</p>
                  <p className="mt-1 font-medium text-[var(--color-ink)]">{invoice.customer_name}</p>
                  <p className="text-sm text-[var(--color-body)]">{invoice.customer_email}</p>
                  {invoice.customer_phone && (
                    <p className="text-sm text-[var(--color-body)]">{invoice.customer_phone}</p>
                  )}
                </div>

                <Separator />

                {/* Line items */}
                <div className="p-4 sm:p-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Items</p>
                  <div className="space-y-2">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="text-[var(--color-ink)]">{item.item_name}</p>
                          {item.description && (
                            <p className="text-xs text-[var(--color-muted)]">{item.description}</p>
                          )}
                          <p className="text-xs text-[var(--color-muted)]">
                            {item.quantity} × {formatMoney(item.unit_price, invoice.currency)}
                          </p>
                        </div>
                        <span className="shrink-0 font-ledger text-[var(--color-ink)]">
                          {formatMoney(item.amount, invoice.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals summary */}
                  <div className="mt-4 space-y-1 border-t border-[var(--color-line)] pt-3 text-sm">
                    {Number(invoice.discount) > 0 && (
                      <div className="flex justify-between text-[var(--color-body)]">
                        <span>Discount</span>
                        <span className="font-ledger">−{formatMoney(invoice.discount, invoice.currency)}</span>
                      </div>
                    )}
                    {Number(invoice.tax) > 0 && (
                      <div className="flex justify-between text-[var(--color-body)]">
                        <span>Tax</span>
                        <span className="font-ledger">+{formatMoney(invoice.tax, invoice.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-[var(--color-ink)]">
                      <span>Total</span>
                      <span className="font-ledger">{formatMoney(invoice.total_amount, invoice.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes / Terms */}
                {(invoice.notes || invoice.terms) && (
                  <>
                    <Separator />
                    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                      {invoice.notes && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Notes</p>
                          <p className="mt-1 text-sm text-[var(--color-body)]">{invoice.notes}</p>
                        </div>
                      )}
                      {invoice.terms && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Terms</p>
                          <p className="mt-1 text-sm text-[var(--color-body)]">{invoice.terms}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              {invoice.status === "paid" ? (
                <div className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-status-paid)] bg-[color-mix(in_srgb,var(--color-status-paid)_10%,transparent)] py-4 text-sm font-medium text-[var(--color-status-paid)]">
                  <CheckCircle2 className="size-5" />
                  Paid in full — thank you!
                </div>
              ) : invoice.payment_link ? (
                <Button asChild className="w-full" size="lg">
                  <a href={invoice.payment_link} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Pay {formatMoney(amountDue, invoice.currency)} now
                  </a>
                </Button>
              ) : (
                <p className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-center text-sm text-[var(--color-muted)]">
                  Payment isn't available for this invoice yet.
                </p>
              )}

              {/* Footer */}
              <p className="text-center text-xs text-[var(--color-muted)]">
                Powered by{" "}
                <a
                  href="https://synchgate.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Synchgate
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
