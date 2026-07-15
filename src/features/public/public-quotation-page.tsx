import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Copy, Clock, Loader2 } from "lucide-react";
import { getPublicQuotation, respondToQuotation } from "@/api/endpoints/quotations";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { QuotationStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/components/ui/toaster";

export function PublicQuotationPage() {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const [decision, setDecision]   = useState<"accepted" | "rejected" | null>(null);
  const [note, setNote]           = useState("");
  const [responded, setResponded] = useState(false);

  const { data: quote, isLoading, isError, refetch } = useQuery({
    queryKey: ["public", "quotation", quoteNumber],
    queryFn: () => getPublicQuotation(quoteNumber as string),
    enabled: !!quoteNumber,
    retry: false,
  });

  const respond = useMutation({
    mutationFn: ({ dec, n }: { dec: "accepted" | "rejected"; n: string }) =>
      respondToQuotation(quoteNumber as string, dec, n),
    onSuccess: () => setResponded(true),
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleRespond = (dec: "accepted" | "rejected") => {
    setDecision(dec);
    respond.mutate({ dec, n: note });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied.");
  };

  const isDecided = responded || ["accepted", "rejected", "expired", "converted", "cancelled"].includes(quote?.status ?? "");
  const expiryDaysLeft = quote
    ? Math.round((new Date(quote.expiry_date).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <Copy className="size-3.5" />Copy link
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
          ) : isError || !quote ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <ErrorState title="Quotation not found" description="This link may be invalid or the quotation has been removed." onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main card */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
                  <div>
                    <p className="font-ledger text-base font-medium text-[var(--color-ink)] sm:text-lg">{quote.quote_number.split("-").slice(0, 3).join("-")}</p>
                    <p className="mt-0.5 text-sm text-[var(--color-body)]">From {quote.customer_name ? "— " : ""}{quote.quote_number.split("-")[0]}</p>
                  </div>
                  <QuotationStatusBadge status={quote.status} />
                </div>

                {/* Total amount */}
                <div className="mx-4 mb-4 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] p-4 sm:mx-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Quoted amount</p>
                  <p className="mt-1 font-ledger text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
                    {formatMoney(quote.total_amount, quote.currency)}
                  </p>
                  {expiryDaysLeft !== null && expiryDaysLeft >= 0 && !isDecided && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      <Clock className="size-3.5" />
                      {expiryDaysLeft === 0 ? "Expires today" : `Expires in ${expiryDaysLeft} day${expiryDaysLeft === 1 ? "" : "s"}`}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Billed to */}
                <div className="p-4 sm:p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Prepared for</p>
                  <p className="mt-1 font-medium text-[var(--color-ink)]">{quote.customer_name}</p>
                  <p className="text-sm text-[var(--color-body)]">{quote.customer_email}</p>
                  {quote.customer_phone && <p className="text-sm text-[var(--color-body)]">{quote.customer_phone}</p>}
                </div>

                <Separator />

                {/* Items */}
                <div className="p-4 sm:p-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Items</p>
                  <div className="space-y-3">
                    {quote.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="text-[var(--color-ink)]">{item.item_name}</p>
                          {item.description && <p className="text-xs text-[var(--color-muted)]">{item.description}</p>}
                          <p className="text-xs text-[var(--color-muted)]">
                            {item.quantity} × {formatMoney(item.unit_price, quote.currency)}
                          </p>
                        </div>
                        <span className="shrink-0 font-ledger text-[var(--color-ink)]">
                          {formatMoney(item.amount, quote.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals summary */}
                  <div className="mt-4 space-y-1 border-t border-[var(--color-line)] pt-3 text-sm">
                    {Number(quote.discount) > 0 && (
                      <div className="flex justify-between text-[var(--color-body)]"><span>Discount</span><span className="font-ledger">−{formatMoney(quote.discount, quote.currency)}</span></div>
                    )}
                    {Number(quote.tax) > 0 && (
                      <div className="flex justify-between text-[var(--color-body)]"><span>Tax</span><span className="font-ledger">+{formatMoney(quote.tax, quote.currency)}</span></div>
                    )}
                    <div className="flex justify-between font-medium text-[var(--color-ink)]">
                      <span>Total</span><span className="font-ledger">{formatMoney(quote.total_amount, quote.currency)}</span>
                    </div>
                  </div>
                </div>

                {(quote.notes || quote.terms) && (
                  <>
                    <Separator />
                    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                      {quote.notes && <div><p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Notes</p><p className="mt-1 text-sm text-[var(--color-body)]">{quote.notes}</p></div>}
                      {quote.terms && <div><p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Terms</p><p className="mt-1 text-sm text-[var(--color-body)]">{quote.terms}</p></div>}
                    </div>
                  </>
                )}
              </div>

              {/* Response area */}
              {!isDecided && quote.status !== "expired" && quote.status !== "cancelled" && (
                <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Your response</p>
                    <p className="text-sm text-[var(--color-body)]">Let the merchant know your decision. You can add an optional note.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customer_note">Note (optional)</Label>
                    <Textarea
                      id="customer_note"
                      placeholder="e.g. Looks good, please proceed. / Can we adjust the timeline?"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="flex-1 bg-[var(--color-qstatus-accepted)] text-white hover:opacity-90"
                      onClick={() => handleRespond("accepted")}
                      disabled={respond.isPending}
                    >
                      {respond.isPending && decision === "accepted" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Accept quotation
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 border border-[var(--color-qstatus-rejected)] text-[var(--color-qstatus-rejected)] hover:bg-[color-mix(in_srgb,var(--color-qstatus-rejected)_8%,transparent)]"
                      onClick={() => handleRespond("rejected")}
                      disabled={respond.isPending}
                    >
                      {respond.isPending && decision === "rejected" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Post-response feedback */}
              {responded && decision === "accepted" && (
                <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-qstatus-accepted)] bg-[color-mix(in_srgb,var(--color-qstatus-accepted)_10%,transparent)] p-4">
                  <CheckCircle2 className="size-5 shrink-0 text-[var(--color-qstatus-accepted)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Quotation accepted!</p>
                    <p className="text-sm text-[var(--color-body)]">The merchant has been notified and will be in touch shortly.</p>
                  </div>
                </div>
              )}
              {responded && decision === "rejected" && (
                <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-qstatus-rejected)] bg-[color-mix(in_srgb,var(--color-qstatus-rejected)_10%,transparent)] p-4">
                  <XCircle className="size-5 shrink-0 text-[var(--color-qstatus-rejected)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Quotation rejected</p>
                    <p className="text-sm text-[var(--color-body)]">The merchant has been notified.</p>
                  </div>
                </div>
              )}

              {/* Already-decided states */}
              {!responded && quote.status === "accepted" && (
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-qstatus-accepted)] bg-[color-mix(in_srgb,var(--color-qstatus-accepted)_10%,transparent)] p-4 text-sm font-medium text-[var(--color-qstatus-accepted)]">
                  <CheckCircle2 className="size-5" />You already accepted this quotation.
                </div>
              )}
              {!responded && quote.status === "rejected" && (
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-qstatus-rejected)] bg-[color-mix(in_srgb,var(--color-qstatus-rejected)_10%,transparent)] p-4 text-sm font-medium text-[var(--color-qstatus-rejected)]">
                  <XCircle className="size-5" />You already rejected this quotation.
                </div>
              )}
              {quote.status === "expired" && (
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-qstatus-expired)] bg-[color-mix(in_srgb,var(--color-qstatus-expired)_10%,transparent)] p-4 text-sm font-medium text-[var(--color-qstatus-expired)]">
                  <Clock className="size-5" />This quotation expired on {formatDate(quote.expiry_date)}.
                </div>
              )}
              {quote.status === "converted" && (
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-qstatus-converted)] bg-[color-mix(in_srgb,var(--color-qstatus-converted)_10%,transparent)] p-4 text-sm font-medium text-[var(--color-qstatus-converted)]">
                  <CheckCircle2 className="size-5" />This quote has been accepted and converted to an invoice.
                </div>
              )}

              <p className="text-center text-xs text-[var(--color-muted)]">
                Powered by{" "}
                <a href="https://ebs.entacrest.com" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">Entacrest</a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
