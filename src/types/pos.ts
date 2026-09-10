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
