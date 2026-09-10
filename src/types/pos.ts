// Mirrors pos/models + pos/serializers exactly.

export interface Category {
  id: string;
  name: string;
}

export interface CategoryCreateInput {
  name: string;
}

export interface ProductListEntry {
  id: string;
  name: string;
  category: Category | null;
  price: string;
  barcode: string | null;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductDetail extends ProductListEntry {
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  name: string;
  category_id?: string | null;
  price: number;
  barcode?: string;
  stock_quantity?: number;
}

export interface ProductImportResult {
  created: number;
  skipped: { row: number; reason: string }[];
}

export type PaymentMethod = "cash" | "other";

export interface SaleItem {
  id: string;
  product: string | null;
  item_name: string;
  unit_price: string;
  quantity: string;
  amount: string;
}

export type SalePeriod = "today" | "week" | "month" | "year";

export interface SaleListFilters {
  period?: SalePeriod;
  date?: string;
  search?: string;
  page?: number;
}

export interface SaleListEntry {
  id: string;
  sale_number: string;
  payment_method: PaymentMethod;
  total_amount: string;
  created_at: string;
}

export interface SaleDetail extends SaleListEntry {
  items: SaleItem[];
  recorded_by_name: string | null;
  merchant_name: string;
  merchant_logo: string | null;
}

export interface SaleItemInput {
  product_id?: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
}

export interface SaleCreateInput {
  id?: string;
  payment_method: PaymentMethod;
  items: SaleItemInput[];
}

export interface TodaySalesSummary {
  count: number;
  total: string;
}

export interface PosTopProduct {
  item_name: string;
  quantity_sold: string;
  revenue: string;
}

export interface PosPaymentBreakdownEntry {
  payment_method: PaymentMethod;
  count: number;
  total: string;
}

export interface PosLowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

export interface PosDailySales {
  date: string;
  total: string;
  count: number;
}

export interface PosAnalytics {
  period: SalePeriod | null;
  date_from: string;
  date_to: string;
  merchant_name: string;
  merchant_logo: string | null;
  total_sales: number;
  total_revenue: string;
  average_sale_value: string;
  items_sold: string;
  payment_breakdown: PosPaymentBreakdownEntry[];
  top_products: PosTopProduct[];
  low_stock_products: PosLowStockProduct[];
  daily_sales: PosDailySales[];
}

/**
 * A sale completed while offline, queued locally and not yet on the server.
 * Shape-compatible with SaleDetail (same fields, `sync_status` added) so the
 * receipt view, Sales History table, and print/PDF functions all accept one
 * with zero special-casing. `sale_number` gets a "PENDING-" prefix instead
 * of the server's "SALE-" so it's visibly distinguishable and can never
 * collide with a real one once synced.
 */
export interface PendingSale extends SaleDetail {
  sync_status: "pending" | "failed";
  /** Set when sync_status is "failed" — e.g. the item was oversold while offline. */
  sync_error?: string;
}
