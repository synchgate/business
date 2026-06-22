import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDirectory } from "@/hooks/use-customers";
import { formatDate, formatMoney } from "@/lib/format";

export function CustomerListPage() {
  const { customers, isLoading, isError, refetch } = useCustomerDirectory();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Customers</h2>
        <p className="text-sm text-[var(--color-body)]">
          Built from your invoice history — grouped by customer email.
        </p>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load your customers right now." onRetry={() => refetch()} />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Customers show up here automatically once you create invoices for them."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Total billed</TableHead>
                  <TableHead>Total paid</TableHead>
                  <TableHead>Last invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.email}>
                    <TableCell>
                      <Link
                        to={`/invoices?customer_email=${encodeURIComponent(customer.email)}`}
                        className="flex flex-col"
                      >
                        <span className="font-medium text-[var(--color-ink)]">{customer.name}</span>
                        <span className="text-xs text-[var(--color-muted)]">{customer.email}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{customer.invoiceCount}</TableCell>
                    <TableCell className="font-ledger">{formatMoney(customer.totalBilled, customer.currency)}</TableCell>
                    <TableCell className="font-ledger text-[var(--color-status-paid)]">
                      {formatMoney(customer.totalPaid, customer.currency)}
                    </TableCell>
                    <TableCell className="font-ledger text-[var(--color-body)]">
                      {formatDate(customer.lastInvoiceDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
