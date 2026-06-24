import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Ban,
  Bell,
  Copy,
  ExternalLink,
  FileDown,
  Link2,
  Loader2,
  Pencil,
  Printer,
  Send,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCancelInvoice,
  useDeleteInvoice,
  useInvoiceDetail,
  useInvoiceReceipt,
  useRemindInvoice,
  useSendInvoice,
} from "@/hooks/use-invoices";
import { useVirtualAccount } from "@/hooks/use-virtual-account";
import { useSettlementAccount } from "@/hooks/use-settlement-account";
import { formatDate, formatMoney } from "@/lib/format";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
import { generateReceiptPdf } from "@/lib/pdf-receipt";

const PUBLIC_BASE = `${window.location.origin}/pay`;

function isNotImplemented(err: unknown) {
  return isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 405);
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading, isError, refetch } = useInvoiceDetail(id);
  const sendInvoice = useSendInvoice();
  const remindInvoice = useRemindInvoice();
  const cancelInvoice = useCancelInvoice();
  const deleteInvoice = useDeleteInvoice();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Virtual / settlement account for print
  const { virtualAccount } = useVirtualAccount();
  const { settlementAccount } = useSettlementAccount();

  // Receipt — only fetch when invoice is paid
  const isPaid = invoice?.status === "paid" || invoice?.status === "partially_paid";
  useInvoiceReceipt(id, isPaid);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !invoice) {
    return <ErrorState description="Couldn't load this invoice." onRetry={() => refetch()} />;
  }

  const canSend = invoice.status === "draft" || invoice.status === "sent";
  const canCancel = !["paid", "cancelled"].includes(invoice.status);
  const canRemind = ["sent", "viewed", "partially_paid", "overdue"].includes(invoice.status);

  // Public shareable URL
  const shareableUrl = `${PUBLIC_BASE}/${invoice.invoice_number}`;

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(invoice.id);
      toast.success("Invoice sent by email and WhatsApp.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't send the invoice."));
    }
  };

  const handleRemind = async () => {
    try {
      await remindInvoice.mutateAsync(invoice.id);
      toast.success("Reminder sent.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't send a reminder."));
    }
  };

  const handleCancel = async () => {
    setConfirmCancel(false);
    try {
      await cancelInvoice.mutateAsync(invoice.id);
      toast.success("Invoice cancelled.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't cancel the invoice."));
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      toast.success("Invoice deleted.");
      navigate("/invoices");
    } catch (err) {
      if (isNotImplemented(err)) {
        toast.info("Deleting invoices isn't available yet — coming soon.");
        return;
      }
      toast.error("Couldn't delete the invoice.");
    }
  };

  const handleEdit = () => navigate(`/invoices/${invoice.id}/edit`);

  const handleCopyPaymentLink = () => {
    if (!invoice.payment_link) return;
    navigator.clipboard.writeText(invoice.payment_link);
    toast.success("Payment link copied.");
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Shareable link copied.");
  };

  const handleDownloadReceipt = async () => {
    setGeneratingPdf(true);
    try {
      await generateReceiptPdf(invoice, { virtualAccount, settlementAccount });
    } catch {
      toast.error("Couldn't generate receipt PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate("/invoices")}>
          <ChevronLeft className="size-4" />
          Invoices
        </Button>

        {/* Action buttons — scroll horizontally on tiny screens */}
        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Button size="sm" onClick={handleSend} disabled={sendInvoice.isPending}>
              {sendInvoice.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {invoice.status === "draft" ? "Send" : "Resend"}
            </Button>
          )}
          {canRemind && (
            <Button size="sm" variant="secondary" onClick={handleRemind} disabled={remindInvoice.isPending}>
              <Bell className="size-4" />
              Remind
            </Button>
          )}

          {/* Share link */}
          <Button size="sm" variant="secondary" onClick={handleCopyShareLink}>
            <Link2 className="size-4" />
            <span className="hidden xs:inline">Share link</span>
            <span className="xs:hidden">Share</span>
          </Button>

          {/* Receipt PDF — only when paid */}
          {isPaid && (
            <Button size="sm" variant="secondary" onClick={handleDownloadReceipt} disabled={generatingPdf}>
              {generatingPdf ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              Receipt
            </Button>
          )}

          <Button size="sm" variant="secondary" onClick={handlePrint}>
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </Button>
          <Button size="sm" variant="secondary" onClick={handleEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
          {canCancel && (
            <Button size="sm" variant="secondary" onClick={() => setConfirmCancel(true)}>
              <Ban className="size-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Shareable link banner */}
      <div className="flex flex-col gap-2 rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-muted)]">Customer payment link</p>
          <p className="truncate font-ledger text-xs text-[var(--color-primary)] sm:text-sm">
            {shareableUrl}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" onClick={handleCopyShareLink}>
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <a href={shareableUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* Main invoice card — printable */}
      <Card id="invoice-printable">
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Logo />
              <p className="mt-3 font-ledger text-base font-medium text-[var(--color-ink)] sm:text-lg">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="text-right">
              <InvoiceStatusBadge status={invoice.status} />
              <p className="mt-2 text-xs text-[var(--color-body)] sm:text-sm">
                Issued {formatDate(invoice.issue_date)}
              </p>
              <p className="text-xs text-[var(--color-body)] sm:text-sm">
                Due {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Billed to / payment link */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Billed to</p>
              <p className="mt-1 font-medium text-[var(--color-ink)]">{invoice.customer_name}</p>
              <p className="text-sm text-[var(--color-body)]">{invoice.customer_email}</p>
              {invoice.customer_phone && (
                <p className="text-sm text-[var(--color-body)]">{invoice.customer_phone}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Payment link</p>
              {invoice.payment_link ? (
                <button
                  onClick={handleCopyPaymentLink}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
                >
                  <Copy className="size-3.5" />
                  Copy link
                </button>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-muted)]">Pending settlement setup</p>
              )}
            </div>
          </div>

          {/* Line items table — horizontal scroll on mobile */}
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
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 sm:px-4">
                      <p className="text-[var(--color-ink)]">{item.item_name}</p>
                      {item.description && (
                        <p className="text-xs text-[var(--color-muted)]">{item.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">
                      {formatMoney(item.unit_price, invoice.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-ledger sm:px-4">
                      {formatMoney(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between text-[var(--color-body)]">
                <span>Subtotal</span>
                <span className="font-ledger">{formatMoney(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-body)]">
                <span>Discount</span>
                <span className="font-ledger">−{formatMoney(invoice.discount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-body)]">
                <span>Tax</span>
                <span className="font-ledger">+{formatMoney(invoice.tax, invoice.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-medium text-[var(--color-ink)]">
                <span>Total</span>
                <span className="font-ledger">{formatMoney(invoice.total_amount, invoice.currency)}</span>
              </div>
              {Number(invoice.amount_paid) > 0 && (
                <div className="flex justify-between text-[var(--color-status-paid)]">
                  <span>Paid</span>
                  <span className="font-ledger">{formatMoney(invoice.amount_paid, invoice.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank details — only visible on print */}
          {(virtualAccount || settlementAccount) && (
            <div className="hidden print:block">
              <Separator />
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  {virtualAccount ? "Virtual Account" : "Settlement Account"}
                </p>
                {virtualAccount ? (
                  <div className="mt-2 space-y-0.5">
                    <p className="font-medium text-[var(--color-ink)]">{virtualAccount.account_name}</p>
                    <p className="text-sm text-[var(--color-body)]">{virtualAccount.bank_name}</p>
                    <p className="font-ledger text-sm text-[var(--color-ink)]">{virtualAccount.dedicated_account_number}</p>
                  </div>
                ) : settlementAccount ? (
                  <div className="mt-2 space-y-0.5">
                    <p className="font-medium text-[var(--color-ink)]">{settlementAccount.account_name}</p>
                    <p className="text-sm text-[var(--color-body)]">{settlementAccount.bank_name}</p>
                    <p className="font-ledger text-sm text-[var(--color-ink)]">{settlementAccount.account_number}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {(invoice.notes || invoice.terms) && (
            <>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Receipt card — shown when paid */}
      {isPaid && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {invoice.paid_at && (
                <p className="text-sm text-[var(--color-body)]">
                  Paid on {formatDate(invoice.paid_at)}
                </p>
              )}
              <p className="text-sm font-medium text-[var(--color-status-paid)]">
                {formatMoney(invoice.amount_paid, invoice.currency)} received
              </p>
            </div>
            <div className="flex gap-2">
              {invoice.receipt_url && (
                <Button size="sm" variant="secondary" asChild>
                  <a href={invoice.receipt_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    View online
                  </a>
                </Button>
              )}
              <Button size="sm" onClick={handleDownloadReceipt} disabled={generatingPdf}>
                {generatingPdf ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm cancel */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this invoice?</DialogTitle>
            <DialogDescription>
              The customer will no longer be able to pay {invoice.invoice_number}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Keep invoice
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this invoice?</DialogTitle>
            <DialogDescription>
              This permanently removes {invoice.invoice_number}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep invoice
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}