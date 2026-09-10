import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Printer, Receipt, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PosTabs } from "@/features/pos/pos-tabs";
import { PosSyncStatus } from "@/features/pos/pos-sync-status";
import { useSaleList, useSaleDetail, useTodaySalesSummary } from "@/hooks/use-pos";
import { usePendingSales } from "@/hooks/use-pending-sales";
import { formatMoney, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { pendingSalesMatchingFilters, syncPendingSales } from "@/lib/pos-sync";
import { removePendingSale } from "@/lib/offline-store";
import { downloadSaleReceiptPdf, printSaleReceipt } from "@/lib/sale-receipt";
import type { PendingSale, SaleDetail, SaleListEntry, SalePeriod } from "@/types/pos";

function isPendingSale(sale: SaleListEntry | SaleDetail | PendingSale): sale is PendingSale {
  return "sync_status" in sale;
}

const PERIODS: { value: SalePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

export function SalesHistoryPage() {
  const [period, setPeriod] = useState<SalePeriod>("today");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleListEntry | PendingSale | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = useSaleList({
    period,
    page,
    search: debouncedSearch || undefined,
    date: date || undefined,
  });
  const { data: summary } = useTodaySalesSummary(period);
  const pendingSales = usePendingSales();
  const matchingPending = pendingSalesMatchingFilters(pendingSales, {
    period,
    date: date || undefined,
    search: debouncedSearch || undefined,
  });
  // Pending sales are always "now" — only surface them on page 1, since
  // they aren't part of the server's actual pagination.
  const sales: (SaleListEntry | PendingSale)[] =
    page === 1 ? [...matchingPending, ...(data?.results ?? [])] : (data?.results ?? []);

  const pendingTotal = matchingPending.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const displayTotal = (Number(summary?.total ?? 0) + pendingTotal).toFixed(2);
  const displayCount = (summary?.count ?? 0) + matchingPending.length;

  function changePeriod(next: SalePeriod) {
    setPeriod(next);
    setPage(1);
  }

  function changeDate(next: string) {
    setDate(next);
    setPage(1);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PosTabs />
      <PosSyncStatus />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Sales history</h2>
          <p className="text-sm text-[var(--color-body)]">Items sold at checkout, by period.</p>
        </div>
        <div className="rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm">
          <span className="text-[var(--color-muted)]">
            {PERIODS.find((p) => p.value === period)?.label}:{" "}
          </span>
          <span className="font-medium text-[var(--color-ink)]">
            {summary
              ? `${formatMoney(displayTotal)} · ${displayCount} sale${displayCount === 1 ? "" : "s"}`
              : "—"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => changePeriod(p.value)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center rounded-[var(--radius-chip)] px-3 text-sm font-medium transition-colors",
                period === p.value
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                  : "text-[var(--color-body)] hover:text-[var(--color-ink)]",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            placeholder="Search by sale ref or payment method"
            className="pl-9 pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => changeDate(e.target.value)}
            className="w-full sm:w-auto"
            aria-label="Filter by date"
          />
          {date && (
            <Button variant="secondary" size="sm" className="shrink-0" onClick={() => changeDate("")}>
              Clear date
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-3 p-4 sm:p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load sales." onRetry={refetch} />
          ) : sales.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No sales found"
              description={
                debouncedSearch || date
                  ? "No sales match your search or date filter."
                  : `No sales recorded for ${PERIODS.find((p) => p.value === period)?.label.toLowerCase()}.`
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <TableCell className="font-medium text-[var(--color-ink)]">
                          <div className="flex items-center gap-2">
                            {sale.sale_number}
                            {isPendingSale(sale) && (
                              <span
                                className={cn(
                                  "rounded-[var(--radius-chip)] px-1.5 py-0.5 text-[10px] font-medium",
                                  sale.sync_status === "failed"
                                    ? "bg-[color-mix(in_srgb,var(--color-status-overdue)_14%,transparent)] text-[var(--color-status-overdue)]"
                                    : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
                                )}
                              >
                                {sale.sync_status === "failed" ? "Sync failed" : "Pending sync"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--color-body)]">{formatDateTime(sale.created_at)}</TableCell>
                        <TableCell className="capitalize text-[var(--color-body)]">{sale.payment_method}</TableCell>
                        <TableCell className="font-ledger text-[var(--color-ink)]">
                          {formatMoney(sale.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-[var(--color-line)] sm:hidden">
                {sales.map((sale) => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => setSelectedSale(sale)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-[var(--color-surface-muted)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-[var(--color-ink)]">{sale.sale_number}</p>
                        {isPendingSale(sale) && (
                          <span
                            className={cn(
                              "shrink-0 rounded-[var(--radius-chip)] px-1.5 py-0.5 text-[10px] font-medium",
                              sale.sync_status === "failed"
                                ? "bg-[color-mix(in_srgb,var(--color-status-overdue)_14%,transparent)] text-[var(--color-status-overdue)]"
                                : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
                            )}
                          >
                            {sale.sync_status === "failed" ? "Sync failed" : "Pending sync"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{formatDateTime(sale.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="font-ledger text-sm font-medium text-[var(--color-ink)]">
                        {formatMoney(sale.total_amount)}
                      </span>
                      <span className="text-xs capitalize text-[var(--color-muted)]">{sale.payment_method}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-line)] px-4 py-3 sm:px-5">
                <p className="text-xs text-[var(--color-muted)]">
                  {data?.count ?? 0} sales
                  {page === 1 && matchingPending.length > 0 &&
                    ` · ${matchingPending.length} pending sync`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data?.previous}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden xs:inline">Previous</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data?.next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SaleDetailDialog sale={selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)} />
    </div>
  );
}

function SaleDetailDialog({
  sale,
  onOpenChange,
}: {
  sale: SaleListEntry | PendingSale | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isPending = !!sale && isPendingSale(sale);
  const { data: fetched, isLoading } = useSaleDetail(!isPending && sale ? sale.id : undefined);
  const detail: SaleDetail | PendingSale | undefined = isPending ? (sale as PendingSale) : fetched;

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{detail?.sale_number ?? "Sale details"}</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {formatDateTime(detail.created_at)}
              </p>
              <p className="mt-1 font-ledger text-3xl font-semibold text-[var(--color-ink)]">
                {formatMoney(detail.total_amount)}
              </p>
              <p className="text-sm capitalize text-[var(--color-body)]">{detail.payment_method}</p>
              {detail.recorded_by_name && (
                <p className="text-xs text-[var(--color-muted)]">Recorded by {detail.recorded_by_name}</p>
              )}
              {isPendingSale(detail) && detail.sync_status === "pending" && (
                <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                  Pending sync — will upload automatically when you're back online.
                </p>
              )}
              {isPendingSale(detail) && detail.sync_status === "failed" && (
                <p className="mt-2 text-xs font-medium text-[var(--color-status-overdue)]">
                  Couldn't sync: {detail.sync_error}
                </p>
              )}
            </div>
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-[var(--color-ink)]">
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-ledger text-[var(--color-body)]">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => printSaleReceipt(detail)}
              >
                <Printer className="size-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => downloadSaleReceiptPdf(detail)}
              >
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
            {isPendingSale(detail) && detail.sync_status === "failed" && (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => syncPendingSales()}>
                  Retry sync
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 text-[var(--color-status-overdue)]"
                  onClick={() => {
                    removePendingSale(detail.id);
                    onOpenChange(false);
                  }}
                >
                  Discard
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
