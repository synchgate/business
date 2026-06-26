import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Ban, Bell, ChevronLeft, Copy, ExternalLink, FileText,
  Link2, Loader2, Pencil, Send, CheckCircle2,
  XCircle, Clock, ArrowRightCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { QuotationStatusBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useCancelQuotation, useConvertQuotation, useQuotationDetail, useSendQuotation,
} from "@/hooks/use-quotations";
import { formatDate, formatMoney, QUOTE_STATUS_LABEL } from "@/lib/format";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
// import { Separator as Sep } from "@/components/ui/separator";

const PUBLIC_BASE = `${window.location.origin}/quote`;

const ACTIVITY_ICON: Record<string, React.ElementType> = {
  created:   FileText,
  sent:      Send,
  viewed:    Bell,
  accepted:  CheckCircle2,
  rejected:  XCircle,
  revised:   Pencil,
  expired:   Clock,
  converted: ArrowRightCircle,
  cancelled: Ban,
};

const ACTIVITY_COLOR: Record<string, string> = {
  created:   "var(--color-muted)",
  sent:      "var(--color-primary)",
  viewed:    "#7c3aed",
  accepted:  "var(--color-qstatus-accepted)",
  rejected:  "var(--color-qstatus-rejected)",
  revised:   "var(--color-body)",
  expired:   "var(--color-qstatus-expired)",
  converted: "var(--color-qstatus-converted)",
  cancelled: "var(--color-muted)",
};

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quote, isLoading, isError, refetch } = useQuotationDetail(id);
  const sendQuotation    = useSendQuotation();
  const cancelQuotation  = useCancelQuotation();
  const convertQuotation = useConvertQuotation();

  const [confirmCancel,  setConfirmCancel]  = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);
  const [convertDueDate, setConvertDueDate] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);

  if (isLoading) return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (isError || !quote) return <ErrorState description="Couldn't load this quotation." onRetry={() => refetch()} />;

  const shareableUrl = `${PUBLIC_BASE}/${quote.quote_number}`;
  const canSend      = ["draft", "sent"].includes(quote.status);
  const canCancel    = !["converted", "cancelled"].includes(quote.status);
  const canConvert   = quote.status === "accepted";
  const canEdit      = ["draft", "sent"].includes(quote.status);

  const handleSend = async () => {
    try {
      await sendQuotation.mutateAsync(quote.id);
      toast.success("Quotation sent to customer.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't send the quotation."));
    }
  };

  const handleCancel = async () => {
    setConfirmCancel(false);
    try {
      await cancelQuotation.mutateAsync(quote.id);
      toast.success("Quotation cancelled.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't cancel."));
    }
  };

  const handleConvert = async () => {
    setConvertLoading(true);
    try {
      const result = await convertQuotation.mutateAsync({
        id: quote.id,
        input: { due_date: convertDueDate || undefined },
      });
      toast.success(`Converted to invoice ${result.invoice.invoice_number}.`);
      setConfirmConvert(false);
      navigate(`/invoices/${result.invoice.id}`);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't convert quotation."));
    } finally {
      setConvertLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Link copied.");
  };

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate("/quotes")}>
          <ChevronLeft className="size-4" />Quotations
        </Button>
        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Button size="sm" onClick={handleSend} disabled={sendQuotation.isPending}>
              {sendQuotation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {quote.status === "draft" ? "Send" : "Resend"}
            </Button>
          )}
          {canConvert && (
            <Button size="sm" onClick={() => setConfirmConvert(true)}
              className="bg-[var(--color-qstatus-accepted)] text-white hover:opacity-90">
              <ArrowRightCircle className="size-4" />Convert to invoice
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleCopyShareLink}>
            <Link2 className="size-4" />
            <span className="hidden xs:inline">Share link</span>
            <span className="xs:hidden">Share</span>
          </Button>
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={() => navigate(`/quotes/${quote.id}/edit`)}>
              <Pencil className="size-4" />Edit
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="secondary" onClick={() => setConfirmCancel(true)}>
              <Ban className="size-4" /><span className="hidden sm:inline">Cancel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Share link banner */}
      <div className="flex flex-col gap-2 rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-muted)]">Customer quote link</p>
          <p className="truncate font-ledger text-xs text-[var(--color-primary)] sm:text-sm">{shareableUrl}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" onClick={handleCopyShareLink}><Copy className="size-3.5" />Copy</Button>
          <Button size="sm" variant="secondary" asChild>
            <a href={shareableUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />Open</a>
          </Button>
        </div>
      </div>

      {/* Accepted banner → convert CTA */}
      {canConvert && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-chip)] border border-[var(--color-qstatus-accepted)] bg-[color-mix(in_srgb,var(--color-qstatus-accepted)_10%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-[var(--color-qstatus-accepted)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Customer accepted this quotation</p>
              {quote.customer_note && (
                <p className="mt-0.5 text-sm text-[var(--color-body)]">"{quote.customer_note}"</p>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => setConfirmConvert(true)}
            className="shrink-0 bg-[var(--color-qstatus-accepted)] text-white hover:opacity-90">
            <ArrowRightCircle className="size-4" />Convert to invoice
          </Button>
        </div>
      )}

      {/* Rejected banner */}
      {quote.status === "rejected" && (
        <div className="flex items-start gap-3 rounded-[var(--radius-chip)] border border-[var(--color-qstatus-rejected)] bg-[color-mix(in_srgb,var(--color-qstatus-rejected)_10%,transparent)] p-4">
          <XCircle className="size-5 shrink-0 text-[var(--color-qstatus-rejected)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">Customer rejected this quotation</p>
            {quote.customer_note && (
              <p className="mt-0.5 text-sm text-[var(--color-body)]">"{quote.customer_note}"</p>
            )}
          </div>
        </div>
      )}

      {/* Converted banner */}
      {quote.status === "converted" && quote.converted_invoice && (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-chip)] border border-[var(--color-qstatus-converted)] bg-[color-mix(in_srgb,var(--color-qstatus-converted)_10%,transparent)] p-4">
          <div className="flex items-center gap-3">
            <ArrowRightCircle className="size-5 shrink-0 text-[var(--color-qstatus-converted)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Converted to invoice</p>
              <p className="text-sm text-[var(--color-body)]">{quote.converted_invoice_number}</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" asChild>
            <Link to={`/invoices/${quote.converted_invoice}`}>View invoice →</Link>
          </Button>
        </div>
      )}

      {/* Main quotation card */}
      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Logo />
              <p className="mt-3 font-ledger text-base font-medium text-[var(--color-ink)] sm:text-lg">
                {quote.quote_number.split("-").slice(0, 3).join("-")}
              </p>
            </div>
            <div className="text-right">
              <QuotationStatusBadge status={quote.status} />
              <p className="mt-2 text-xs text-[var(--color-body)] sm:text-sm">Issued {formatDate(quote.issue_date)}</p>
              <p className="text-xs text-[var(--color-body)] sm:text-sm">Expires {formatDate(quote.expiry_date)}</p>
            </div>
          </div>

          <Separator />

          {/* Customer */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Quoted to</p>
              <p className="mt-1 font-medium text-[var(--color-ink)]">{quote.customer_name}</p>
              <p className="text-sm text-[var(--color-body)]">{quote.customer_email}</p>
              {quote.customer_phone && <p className="text-sm text-[var(--color-body)]">{quote.customer_phone}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Total value</p>
              <p className="mt-1 font-ledger text-xl font-semibold text-[var(--color-ink)]">
                {formatMoney(quote.total_amount, quote.currency)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto rounded-[var(--radius-chip)] border border-[var(--color-line)]">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-left sm:px-4">Item</th>
                  <th className="px-3 py-2 text-right sm:px-4">Qty</th>
                  <th className="px-3 py-2 text-right sm:px-4">Unit price</th>
                  <th className="px-3 py-2 text-right sm:px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 sm:px-4">
                      <p className="text-[var(--color-ink)]">{item.item_name}</p>
                      {item.description && <p className="text-xs text-[var(--color-muted)]">{item.description}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">{formatMoney(item.unit_price, quote.currency)}</td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">{formatMoney(item.amount, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between text-[var(--color-body)]"><span>Subtotal</span><span className="font-ledger">{formatMoney(quote.subtotal, quote.currency)}</span></div>
              <div className="flex justify-between text-[var(--color-body)]"><span>Discount</span><span className="font-ledger">−{formatMoney(quote.discount, quote.currency)}</span></div>
              <div className="flex justify-between text-[var(--color-body)]"><span>Tax</span><span className="font-ledger">+{formatMoney(quote.tax, quote.currency)}</span></div>
              <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-medium text-[var(--color-ink)]">
                <span>Total</span><span className="font-ledger">{formatMoney(quote.total_amount, quote.currency)}</span>
              </div>
            </div>
          </div>

          {(quote.notes || quote.terms) && (
            <>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                {quote.notes && <div><p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Notes</p><p className="mt-1 text-sm text-[var(--color-body)]">{quote.notes}</p></div>}
                {quote.terms && <div><p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Terms</p><p className="mt-1 text-sm text-[var(--color-body)]">{quote.terms}</p></div>}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity log */}
      {quote.activity_log.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {quote.activity_log.map((entry) => {
              const Icon  = ACTIVITY_ICON[entry.activity] ?? FileText;
              const color = ACTIVITY_COLOR[entry.activity] ?? "var(--color-muted)";
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                    <Icon className="size-3.5" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium capitalize text-[var(--color-ink)]">
                        {QUOTE_STATUS_LABEL[entry.activity as keyof typeof QUOTE_STATUS_LABEL] ?? entry.activity}
                      </p>
                      <p className="shrink-0 text-xs text-[var(--color-muted)]">
                        {new Date(entry.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    {entry.note && <p className="mt-0.5 text-sm text-[var(--color-body)]">{entry.note}</p>}
                    <p className="text-xs text-[var(--color-muted)] capitalize">{entry.performed_by}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Cancel dialog */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this quotation?</DialogTitle>
            <DialogDescription>The customer will no longer be able to accept {quote.quote_number}. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>Keep quotation</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel quotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert dialog */}
      <Dialog open={confirmConvert} onOpenChange={setConfirmConvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to invoice</DialogTitle>
            <DialogDescription>
              A new draft invoice will be created from this quotation. You can review and edit it before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="convert_due_date">Invoice due date (optional)</Label>
            <Input id="convert_due_date" type="date" value={convertDueDate} onChange={(e) => setConvertDueDate(e.target.value)} />
            <p className="text-xs text-[var(--color-muted)]">Leave blank to use the quotation's expiry date.</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setConfirmConvert(false)}>Cancel</Button>
            <Button onClick={handleConvert} disabled={convertLoading}>
              {convertLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightCircle className="size-4" />}
              Convert to invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
