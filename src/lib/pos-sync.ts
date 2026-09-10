// Sync manager for offline-queued sales. Mirrors what SaleService.create_sale
// computes server-side (pos/services/sale_service.py) so a locally-built
// receipt shows real numbers, and mirrors SaleViewSet.get_queryset's period/
// date/search filtering (pos/views/sale.py) so a queued sale merges
// correctly into whatever filter Sales History has active.

import { createSale } from "@/api/endpoints/pos";
import { getPendingSales, removePendingSale } from "@/lib/offline-store";
import { queryClient } from "@/lib/query-client";
import type { PaymentMethod, PendingSale, SaleItem, SalePeriod } from "@/types/pos";

interface CartLine {
  product_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
}

function generatePendingSaleNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `PENDING-${suffix}`;
}

export function buildPendingSale(cart: CartLine[], paymentMethod: PaymentMethod): PendingSale {
  const now = new Date().toISOString();
  const items: SaleItem[] = cart.map((line) => ({
    id: crypto.randomUUID(),
    product: line.product_id,
    item_name: line.item_name,
    unit_price: line.unit_price.toFixed(2),
    quantity: line.quantity.toFixed(2),
    amount: (line.unit_price * line.quantity).toFixed(2),
  }));
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    id: crypto.randomUUID(),
    sale_number: generatePendingSaleNumber(),
    payment_method: paymentMethod,
    total_amount: total.toFixed(2),
    items,
    recorded_by_name: null,
    merchant_name: "",
    merchant_logo: null,
    created_at: now,
    sync_status: "pending",
  };
}

export function isNetworkError(err: unknown): boolean {
  return !(err as { response?: unknown } | undefined)?.response;
}

export async function syncPendingSales(): Promise<{ synced: number }> {
  const queue = getPendingSales();
  let synced = 0;

  for (const sale of queue) {
    try {
      await createSale({
        id: sale.id,
        payment_method: sale.payment_method,
        items: sale.items.map((item) => ({
          product_id: item.product,
          item_name: item.item_name,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
        })),
      });
      removePendingSale(sale.id);
      synced++;
    } catch (err) {
      if (isNetworkError(err)) break; // still offline — stop, try again next time
      // Any other error: leave it queued rather than silently dropping the sale.
    }
  }

  if (synced > 0) {
    queryClient.invalidateQueries({ queryKey: ["pos"] });
  }

  return { synced };
}

function periodStart(period: SalePeriod, today: Date): Date {
  const start = new Date(today);
  if (period === "week") {
    const day = (start.getDay() + 6) % 7; // Monday-start, matches backend's today.weekday()
    start.setDate(start.getDate() - day);
  } else if (period === "month") {
    start.setDate(1);
  } else if (period === "year") {
    start.setMonth(0, 1);
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

export function pendingSalesMatchingFilters(
  pending: PendingSale[],
  filters: { period?: SalePeriod; date?: string; search?: string },
): PendingSale[] {
  return pending.filter((sale) => {
    const saleDate = new Date(sale.created_at);

    if (filters.date) {
      const isoDate = saleDate.toISOString().slice(0, 10);
      if (isoDate !== filters.date) return false;
    } else if (filters.period) {
      const start = periodStart(filters.period, new Date());
      if (saleDate < start) return false;
    }

    if (filters.search) {
      const needle = filters.search.trim().toLowerCase();
      if (needle) {
        const haystack = `${sale.sale_number} ${sale.payment_method}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
    }

    return true;
  });
}
