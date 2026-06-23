import { Link } from "react-router-dom";
import { FileText, Wallet, Clock, AlertTriangle, Plus, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceAnalytics, useInvoiceList } from "@/hooks/use-invoices";
import { useVirtualAccount } from "@/hooks/use-virtual-account";
import { formatDate, formatMoney } from "@/lib/format";

export function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useInvoiceAnalytics();
  const { data: recent, isLoading: recentLoading } = useInvoiceList({});
  const { virtualAccount, isLoading: vaLoading } = useVirtualAccount();

  const recentInvoices = recent?.results?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Overview</h2>
          <p className="text-sm text-[var(--color-body)]">Your invoicing activity at a glance.</p>
        </div>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus className="size-4" />
            New invoice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total invoices"
          value={analytics ? String(analytics.total_invoices) : "—"}
          icon={FileText}
          isLoading={analyticsLoading}
        />
        <StatCard
          label="Collected"
          value={analytics ? formatMoney(analytics.total_revenue_collected) : "—"}
          icon={Wallet}
          hint={analytics ? `${analytics.collection_rate}% collection rate` : undefined}
          isLoading={analyticsLoading}
        />
        <StatCard
          label="Outstanding"
          value={analytics ? formatMoney(analytics.total_outstanding_amount) : "—"}
          icon={Clock}
          hint={analytics ? `${analytics.outstanding_invoices} invoices` : undefined}
          isLoading={analyticsLoading}
        />
        <StatCard
          label="Overdue"
          value={analytics ? String(analytics.overdue_invoices) : "—"}
          icon={AlertTriangle}
          isLoading={analyticsLoading}
        />
      </div>

      {/* Virtual account quick-status */}
      <Card className="border-l-4" style={{ borderLeftColor: "var(--color-primary)" }}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              <Building2 className="size-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Virtual Account</p>
              {vaLoading ? (
                <Skeleton className="mt-1 h-4 w-36" />
              ) : virtualAccount ? (
                <p className="font-ledger text-sm text-[var(--color-body)]">
                  {virtualAccount.dedicated_account_number} · {virtualAccount.bank_name}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">Not set up yet — get a dedicated account number</p>
              )}
            </div>
          </div>
          <Button size="sm" variant={virtualAccount ? "secondary" : "primary"} asChild>
            <Link to="/virtual-account">
              {virtualAccount ? "View account" : "Set up now"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collections, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : analytics && analytics.monthly_collections.length > 0 ? (
            <RevenueChart data={analytics.monthly_collections} />
          ) : (
            <EmptyState
              icon={Wallet}
              title="No collections yet"
              description="Paid invoices will show up here once customers start paying."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recentLoading ? (
            <div className="space-y-2 px-5 pb-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Create your first invoice to start getting paid."
              action={{ label: "New invoice", onClick: () => (window.location.href = "/invoices/new") }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer">
                    <TableCell>
                      <Link to={`/invoices/${invoice.id}`} className="font-ledger text-[var(--color-primary)]">
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell className="font-ledger text-[var(--color-body)]">{formatDate(invoice.due_date)}</TableCell>
                    <TableCell className="font-ledger">{formatMoney(invoice.total_amount, invoice.currency)}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
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
