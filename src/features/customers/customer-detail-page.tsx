import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, FileText, Pencil, UserX, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomer, useDeactivateCustomer, useActivateCustomer } from "@/hooks/use-customers";
import { useInvoiceList } from "@/hooks/use-invoices";
import { CustomerForm } from "@/features/customers/customer-form";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";
import { Link } from "react-router-dom";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, isError, refetch } = useCustomer(id);
  const deactivate = useDeactivateCustomer();
  const activate = useActivateCustomer();
  const [showEdit, setShowEdit] = useState(false);

  // Fetch this customer's invoices via the customer_email filter on invoice list
  const { data: invoicesData } = useInvoiceList(
    customer ? { customer_email: customer.email } : {},
  );
  const invoices = invoicesData?.results ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !customer) {
    return <ErrorState description="Couldn't load this customer." onRetry={() => refetch()} />;
  }

  const displayName =
    customer.customer_type === "business" && customer.business_name
      ? customer.business_name
      : customer.name;

  const handleToggleActive = async () => {
    try {
      if (customer.is_active) {
        await deactivate.mutateAsync(customer.id);
        toast.success("Customer deactivated.");
      } else {
        await activate.mutateAsync(customer.id);
        toast.success("Customer activated.");
      }
      refetch();
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't update customer status.",
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
          <ChevronLeft className="size-4" />
          Customers
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleActive}
            disabled={deactivate.isPending || activate.isPending}
          >
            {customer.is_active ? (
              <><UserX className="size-4" />Deactivate</>
            ) : (
              <><UserCheck className="size-4" />Activate</>
            )}
          </Button>
          <Button size="sm" asChild>
            <Link to={`/invoices/new?customer=${customer.id}`}>
              <FileText className="size-4" />
              Create invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total invoiced", value: formatMoney(customer.total_invoiced) },
          { label: "Total paid", value: formatMoney(customer.total_paid), color: "var(--color-status-paid)" },
          { label: "Outstanding", value: formatMoney(customer.outstanding_balance), color: "var(--color-status-overdue)" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-[var(--color-body)]">{stat.label}</p>
            <p
              className="font-ledger mt-1 text-2xl font-medium"
              style={{ color: stat.color ?? "var(--color-ink)" }}
            >
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Name", value: customer.name },
              { label: "Business", value: customer.business_name },
              { label: "Email", value: customer.email },
              { label: "Phone", value: customer.phone },
              { label: "Type", value: customer.customer_type, capitalize: true },
              { label: "Address", value: [customer.address_line, customer.city, customer.state, customer.country].filter(Boolean).join(", ") || null },
              { label: "Status", value: customer.is_active ? "Active" : "Inactive" },
              { label: "Added", value: formatDate(customer.created_at) },
            ]
              .filter((r) => r.value)
              .map(({ label, value, capitalize }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-[var(--color-muted)]">{label}</span>
                  <span className={`text-right text-[var(--color-ink)] ${capitalize ? "capitalize" : ""}`}>{value}</span>
                </div>
              ))}
            {customer.notes && (
              <div className="border-t border-[var(--color-line)] pt-3">
                <p className="text-[var(--color-muted)]">Notes</p>
                <p className="mt-1 text-[var(--color-body)]">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices ({customer.invoice_count})</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {invoices.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--color-muted)]">No invoices for this customer yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link to={`/invoices/${inv.id}`} className="font-ledger text-[var(--color-primary)]">
                          {inv.invoice_number}
                        </Link>
                        <p className="text-xs text-[var(--color-muted)]">Due {formatDate(inv.due_date)}</p>
                      </TableCell>
                      <TableCell className="font-ledger">
                        {formatMoney(inv.total_amount, inv.currency)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {displayName}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            existing={customer}
            onSuccess={() => { setShowEdit(false); refetch(); }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
