import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Package, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { PosTrendChart } from "@/components/pos/pos-trend-chart";
import { PaymentMixChart } from "@/components/pos/payment-mix-chart";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { PosTabs } from "@/features/pos/pos-tabs";
import { PosSyncStatus } from "@/features/pos/pos-sync-status";
import { PeriodTabs } from "@/features/pos/period-tabs";
import { usePosAnalytics, useSaleList } from "@/hooks/use-pos";
import { formatMoney, formatDateTime } from "@/lib/format";
import type { SalePeriod } from "@/types/pos";

export function PosDashboardPage() {
  const [period, setPeriod] = useState<SalePeriod>("today");
  const { data: analytics, isLoading, isError, refetch } = usePosAnalytics(period);
  const { data: recentSales, isLoading: recentLoading } = useSaleList({ period, page: 1 });

  const recent = recentSales?.results.slice(0, 5) ?? [];
  const hasTrend = !!analytics?.daily_sales.some((d) => Number(d.total) > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <PosTabs />
      <PosSyncStatus />

      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Dashboard</h2>
        <p className="text-sm text-[var(--color-body)]">Your point-of-sale activity at a glance.</p>
      </div>

      <PeriodTabs period={period} onChange={setPeriod} />

      {isError ? (
        <Card>
          <CardContent className="p-5">
            <ErrorState description="Couldn't load dashboard data." onRetry={refetch} />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI grid — 2 cols mobile, 4 cols desktop, matching the main dashboard */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard
              label="Total sales"
              value={analytics ? String(analytics.total_sales) : "—"}
              icon={Receipt}
              isLoading={isLoading}
            />
            <StatCard
              label="Revenue"
              value={analytics ? formatMoney(analytics.total_revenue) : "—"}
              icon={Wallet}
              isLoading={isLoading}
            />
            <StatCard
              label="Average sale"
              value={analytics ? formatMoney(analytics.average_sale_value) : "—"}
              icon={TrendingUp}
              isLoading={isLoading}
            />
            <StatCard
              label="Items sold"
              value={analytics ? String(Number(analytics.items_sold)) : "—"}
              icon={Package}
              isLoading={isLoading}
            />
          </div>

          {/* Trend + payment mix */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sales, last 14 days</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-60 w-full" />
                ) : hasTrend ? (
                  <PosTrendChart data={analytics!.daily_sales} />
                ) : (
                  <EmptyState
                    icon={Receipt}
                    title="No sales yet"
                    description="Sales from the last 14 days will show up here."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Payment mix</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-60 w-full" />
                ) : analytics && analytics.payment_breakdown.length > 0 ? (
                  <PaymentMixChart data={analytics.payment_breakdown} />
                ) : (
                  <EmptyState
                    icon={Wallet}
                    title="No sales in this period"
                    description="Complete a sale to see the payment method split."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top products</CardTitle>
            </CardHeader>
            <CardContent className={!isLoading && analytics && analytics.top_products.length > 0 ? "px-0 pb-0" : undefined}>
              {isLoading ? (
                <div className="space-y-2 px-5 pb-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !analytics || analytics.top_products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No sales yet"
                  description="Your best-selling items in this period will show up here."
                />
              ) : (
                <div className="divide-y divide-[var(--color-line)]">
                  {analytics.top_products.map((p, i) => (
                    <div key={p.item_name} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-muted)]">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--color-ink)]">{p.item_name}</p>
                          <p className="text-xs text-[var(--color-muted)]">{Number(p.quantity_sold)} sold</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-ledger text-sm text-[var(--color-ink)]">
                        {formatMoney(p.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low stock alert — only shown when there's something to act on */}
          {analytics && analytics.low_stock_products.length > 0 && (
            <Card className="border-l-4" style={{ borderLeftColor: "var(--color-status-overdue)" }}>
              <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-[var(--color-status-overdue)]" />
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Low stock</p>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/pos/products">
                      Manage products
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="divide-y divide-[var(--color-line)]">
                  {analytics.low_stock_products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-[var(--color-ink)]">{p.name}</span>
                      <span
                        className={
                          p.stock_quantity <= 0
                            ? "font-ledger text-[var(--color-status-overdue)]"
                            : "font-ledger text-[var(--color-body)]"
                        }
                      >
                        {p.stock_quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Recent sales</CardTitle>
              <Button size="sm" variant="secondary" asChild>
                <Link to="/pos/sales">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className={!recentLoading && recent.length > 0 ? "px-0 pb-0" : undefined}>
              {recentLoading ? (
                <div className="space-y-2 px-5 pb-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <EmptyState icon={Receipt} title="No sales yet" description="Sales recorded at checkout will show up here." />
              ) : (
                <div className="divide-y divide-[var(--color-line)]">
                  {recent.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)]">{sale.sale_number}</p>
                        <p className="text-xs text-[var(--color-muted)]">{formatDateTime(sale.created_at)}</p>
                      </div>
                      <span className="shrink-0 font-ledger text-sm text-[var(--color-ink)]">
                        {formatMoney(sale.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
