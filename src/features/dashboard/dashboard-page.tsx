import { Link } from "react-router-dom";
import { FileText, Wallet, Clock, AlertTriangle, Plus, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusBadge, statusRailStyle } from "@/components/ui/badge";
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
    <div className="space-y-4 md:space-y-6">
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

      {/* Stats grid — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard label="Total invoices" value={analytics ? String(analytics.total_invoices) : "—"} icon={FileText} isLoading={analyticsLoading} />
        <StatCard label="Collected" value={analytics ? formatMoney(analytics.total_revenue_collected) : "—"} icon={Wallet} hint={analytics ? `${analytics.collection_rate}% rate` : undefined} isLoading={analyticsLoading} />
        <StatCard label="Outstanding" value={analytics ? formatMoney(analytics.total_outstanding_amount) : "—"} icon={Clock} hint={analytics ? `${analytics.outstanding_invoices} invoices` : undefined} isLoading={analyticsLoading} />
        <StatCard label="Overdue" value={analytics ? String(analytics.overdue_invoices) : "—"} icon={AlertTriangle} isLoading={analyticsLoading} />
      </div>

      {/* Virtual account banner */}
      <Card className="border-l-4" style={{ borderLeftColor: "var(--color-primary)" }}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              <Building2 className="size-4 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)]">Virtual Account</p>
              {vaLoading ? (
                <Skeleton className="mt-1 h-4 w-36" />
              ) : virtualAccount ? (
                <p className="truncate font-ledger text-sm text-[var(--color-body)]">
                  {virtualAccount.dedicated_account_number} · {virtualAccount.bank_name}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">Get a dedicated account number</p>
              )}
            </div>
          </div>
          <Button size="sm" variant={virtualAccount ? "secondary" : "primary" as "secondary"} asChild>
            <Link to="/virtual-account">
              {virtualAccount ? "View account" : "Set up now"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Collections, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <Skeleton className="h-48 w-full md:h-64" />
          ) : analytics && analytics.monthly_collections.length > 0 ? (
            <RevenueChart data={analytics.monthly_collections} />
          ) : (
            <EmptyState icon={Wallet} title="No collections yet" description="Paid invoices will show up here once customers start paying." />
          )}
        </CardContent>
      </Card>

      {/* Recent invoices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recentLoading ? (
            <div className="space-y-2 px-4 pb-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentInvoices.length === 0 ? (
            <EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to start getting paid." action={{ label: "New invoice", onClick: () => (window.location.href = "/invoices/new") }} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="cursor-pointer border-l-2" style={statusRailStyle(invoice.status)}>
                        <TableCell>
                          <Link to={`/invoices/${invoice.id}`} className="font-ledger text-[var(--color-primary)]">
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{invoice.customer_name}</TableCell>
                        <TableCell className="font-ledger text-sm text-[var(--color-body)]">{formatDate(invoice.due_date)}</TableCell>
                        <TableCell className="font-ledger text-sm">{formatMoney(invoice.total_amount, invoice.currency)}</TableCell>
                        <TableCell className="font-ledger text-sm">{formatMoney(invoice.amount_paid, invoice.currency)}</TableCell>
                        <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-[var(--color-line)]">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    to={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--color-surface-muted)] border-l-2"
                    style={statusRailStyle(invoice.status)}
                  >
                    <div className="min-w-0">
                      <p className="font-ledger text-sm text-[var(--color-primary)]">{invoice.invoice_number}</p>
                      <p className="text-sm text-[var(--color-ink)] truncate">{invoice.customer_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-ledger text-sm text-[var(--color-ink)]">{formatMoney(invoice.total_amount, invoice.currency)}</p>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
