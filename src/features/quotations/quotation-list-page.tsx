import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotationStatusBadge, quoteStatusRailStyle } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotationList } from "@/hooks/use-quotations";
import { formatDate, formatMoney, QUOTE_STATUS_LABEL } from "@/lib/format";
import type { QuotationStatus } from "@/types/quotation";

const STATUS_OPTIONS: QuotationStatus[] = [
  "draft", "sent", "viewed", "accepted", "rejected", "expired", "converted", "cancelled",
];

export function QuotationListPage() {
  const [status, setStatus] = useState<QuotationStatus | "all">("all");
  const [customerEmail, setCustomerEmail] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuotationList({
    status: status === "all" ? undefined : status,
    customer_email: customerEmail || undefined,
    page,
  });

  const quotations = data?.results ?? [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Quotations</h2>
          <p className="text-sm text-[var(--color-body)]">
            Send quotes, get acceptance, then convert to an invoice in one click.
          </p>
        </div>
        <Button asChild>
          <Link to="/quotes/new">
            <Plus className="size-4" />
            New quote
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            placeholder="Search by customer email"
            className="pl-9"
            value={customerEmail}
            onChange={(e) => { setCustomerEmail(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as QuotationStatus | "all"); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{QUOTE_STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load your quotations." onRetry={() => refetch()} />
          ) : quotations.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={customerEmail || status !== "all" ? "No matching quotations" : "No quotations yet"}
              description={
                customerEmail || status !== "all"
                  ? "Try a different filter or search term."
                  : "Create your first quote and share it with a customer."
              }
              action={
                !(customerEmail || status !== "all")
                  ? { label: "New quote", onClick: () => (window.location.href = "/quotes/new") }
                  : undefined
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((q) => (
                      <TableRow key={q.id} className="border-l-2" style={quoteStatusRailStyle(q.status)}>
                        <TableCell>
                          <Link to={`/quotes/${q.id}`} className="font-ledger text-[var(--color-primary)]">
                            {q.quote_number.split("-").slice(0, 3).join("-")}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{q.customer_name}</span>
                            <span className="text-xs text-[var(--color-muted)]">{q.customer_email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-ledger text-sm text-[var(--color-body)]">
                          {formatDate(q.issue_date)}
                        </TableCell>
                        <TableCell className="font-ledger text-sm text-[var(--color-body)]">
                          {formatDate(q.expiry_date)}
                        </TableCell>
                        <TableCell className="font-ledger text-sm">
                          {formatMoney(q.total_amount, q.currency)}
                        </TableCell>
                        <TableCell>
                          <QuotationStatusBadge status={q.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[var(--color-line)]">
                {quotations.map((q) => (
                  <Link
                    key={q.id}
                    to={`/quotes/${q.id}`}
                    className="flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-muted)] transition-colors border-l-2"
                    style={quoteStatusRailStyle(q.status)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-ledger text-sm font-medium text-[var(--color-primary)] truncate">
                        {q.quote_number}
                      </p>
                      <p className="text-sm text-[var(--color-ink)] truncate">{q.customer_name}</p>
                      <p className="text-xs text-[var(--color-muted)] truncate">{q.customer_email}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        Expires {formatDate(q.expiry_date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="font-ledger text-sm font-medium text-[var(--color-ink)]">
                        {formatMoney(q.total_amount, q.currency)}
                      </p>
                      <QuotationStatusBadge status={q.status} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-[var(--color-line)] px-4 py-3 sm:px-5">
                <p className="text-xs text-[var(--color-muted)]">{data?.count ?? 0} quotations</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={!data?.previous} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="size-4" />
                    <span className="hidden xs:inline">Previous</span>
                  </Button>
                  <Button variant="secondary" size="sm" disabled={!data?.next} onClick={() => setPage((p) => p + 1)}>
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
