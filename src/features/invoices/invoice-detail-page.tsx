import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Ban,
  Bell,
  Copy,
  Pencil,
  Printer,
  Send,
  Trash2,
  ChevronLeft,
  Share2,
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
  useRemindInvoice,
  useSendInvoice,
} from "@/hooks/use-invoices";
import { formatDate, formatMoney } from "@/lib/format";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
// import PublicInvoicePage from "@/pages/public-invoice-page";

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

  if (isLoading) {
    return (
      <div className="space-y-4">
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
  const publicInvoiceUrl = `${window.location.origin}/pay/${invoice.invoice_number}`;

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

  const handleCopyLink = () => {
    if (!invoice.payment_link) return;
    navigator.clipboard.writeText(invoice.payment_link);
    toast.success("Payment link copied.");
  };

  const handleCopyInvoiceUrl = async () => {
  try {
    await navigator.clipboard.writeText(publicInvoiceUrl);
    toast.success("Invoice URL copied.");
  } catch {
    toast.error("Failed to copy invoice URL.");
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
          <ChevronLeft className="size-4" />
          Invoices
        </Button>
        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Button size="sm" onClick={handleSend} disabled={sendInvoice.isPending}>
              <Send className="size-4" />
              {invoice.status === "draft" ? "Send" : "Resend"}
            </Button>
          )}
          {canRemind && (
            <Button size="sm" variant="secondary" onClick={handleRemind} disabled={remindInvoice.isPending}>
              <Bell className="size-4" />
              Remind
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyInvoiceUrl}
          >
            <Share2 className="size-4" />
            Share Invoice
          </Button>

          
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={handleEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
          {canCancel && (
            <Button size="sm" variant="secondary" onClick={() => setConfirmCancel(true)}>
              <Ban className="size-4" />
              Cancel
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card id="invoice-printable">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Logo />
              <p className="mt-3 font-ledger text-lg font-medium text-[var(--color-ink)]">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <InvoiceStatusBadge status={invoice.status} />
              <p className="mt-2 text-sm text-[var(--color-body)]">Issued {formatDate(invoice.issue_date)}</p>
              <p className="text-sm text-[var(--color-body)]">Due {formatDate(invoice.due_date)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Billed to</p>
              <p className="mt-1 font-medium text-[var(--color-ink)]">{invoice.customer_name}</p>
              <p className="text-sm text-[var(--color-body)]">{invoice.customer_email}</p>
              {invoice.customer_phone && <p className="text-sm text-[var(--color-body)]">{invoice.customer_phone}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Payment link</p>
              {invoice.payment_link ? (
                <button
                  onClick={handleCopyLink}
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

          <div className="overflow-hidden rounded-[var(--radius-chip)] border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit price</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5">
                      <p className="text-[var(--color-ink)]">{item.item_name}</p>
                      {item.description && <p className="text-xs text-[var(--color-muted)]">{item.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-ledger">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right font-ledger">{formatMoney(item.unit_price, invoice.currency)}</td>
                    <td className="px-4 py-2.5 text-right font-ledger">{formatMoney(item.amount, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

      {invoice.receipt_url && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={invoice.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              View payment receipt
            </a>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this invoice?</DialogTitle>
            <DialogDescription>
              The customer will no longer be able to pay {invoice.invoice_number}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Keep invoice
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this invoice?</DialogTitle>
            <DialogDescription>
              This permanently removes {invoice.invoice_number}. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
