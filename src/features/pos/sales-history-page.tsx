import { useState } from "react";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PosTabs } from "@/features/pos/pos-tabs";
import { useSaleList, useSaleDetail, useTodaySalesSummary } from "@/hooks/use-pos";
import { formatMoney, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SalePeriod } from "@/types/pos";

const PERIODS: { value: SalePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

export function SalesHistoryPage() {
  const [period, setPeriod] = useState<SalePeriod>("today");
  const [page, setPage] = useState(1);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useSaleList({ period, page });
  const { data: summary } = useTodaySalesSummary(period);
  const sales = data?.results ?? [];

  function changePeriod(next: SalePeriod) {
    setPeriod(next);
    setPage(1);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PosTabs />

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
            {summary ? `${formatMoney(summary.total)} · ${summary.count} sale${summary.count === 1 ? "" : "s"}` : "—"}
          </span>
        </div>
      </div>

      <div className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => changePeriod(p.value)}
            className={cn(
              "inline-flex h-7 items-center rounded-[var(--radius-chip)] px-3 text-sm font-medium transition-colors",
              period === p.value
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-body)] hover:text-[var(--color-ink)]",
            )}
          >
            {p.label}
          </button>
        ))}
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
              title="No sales yet"
              description={`No sales recorded for ${PERIODS.find((p) => p.value === period)?.label.toLowerCase()}.`}
            />
          ) : (
            <>
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
                      onClick={() => setSelectedSaleId(sale.id)}
                    >
                      <TableCell className="font-medium text-[var(--color-ink)]">{sale.sale_number}</TableCell>
                      <TableCell className="text-[var(--color-body)]">{formatDateTime(sale.created_at)}</TableCell>
                      <TableCell className="capitalize text-[var(--color-body)]">{sale.payment_method}</TableCell>
                      <TableCell className="font-ledger text-[var(--color-ink)]">
                        {formatMoney(sale.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-[var(--color-line)] px-4 py-3 sm:px-5">
                <p className="text-xs text-[var(--color-muted)]">{data?.count ?? 0} sales</p>
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

      <SaleDetailDialog saleId={selectedSaleId} onOpenChange={(open) => !open && setSelectedSaleId(null)} />
    </div>
  );
}

function SaleDetailDialog({
  saleId,
  onOpenChange,
}: {
  saleId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: sale, isLoading } = useSaleDetail(saleId ?? undefined);

  return (
    <Dialog open={!!saleId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sale?.sale_number ?? "Sale details"}</DialogTitle>
        </DialogHeader>

        {isLoading || !sale ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {formatDateTime(sale.created_at)}
              </p>
              <p className="mt-1 font-ledger text-3xl font-semibold text-[var(--color-ink)]">
                {formatMoney(sale.total_amount)}
              </p>
              <p className="text-sm capitalize text-[var(--color-body)]">{sale.payment_method}</p>
              {sale.recorded_by_name && (
                <p className="text-xs text-[var(--color-muted)]">Recorded by {sale.recorded_by_name}</p>
              )}
            </div>
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-[var(--color-ink)]">
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-ledger text-[var(--color-body)]">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
