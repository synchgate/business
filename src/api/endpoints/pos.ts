import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope, PaginatedEnvelope } from "@/api/envelope";
import type {
  Category,
  CategoryCreateInput,
  PosAnalytics,
  ProductCreateInput,
  ProductDetail,
  ProductImportResult,
  ProductListEntry,
  SaleCreateInput,
  SaleDetail,
  SaleListEntry,
  SaleListFilters,
  SalePeriod,
  TodaySalesSummary,
} from "@/types/pos";

// Mirrors pos/urls.py + pos/views/*.py exactly.

export async function listCategories() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<Category[]>>("pos/categories/");
  return data.data;
}

export async function createCategory(input: CategoryCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<Category>>("pos/categories/", input);
  return data.data;
}

export async function updateCategory(id: string, input: CategoryCreateInput) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<Category>>(`pos/categories/${id}/`, input);
  return data.data;
}

export async function deleteCategory(id: string) {
  const { data } = await apiClient.delete<ApiSuccessEnvelope<null>>(`pos/categories/${id}/`);
  return data;
}

export interface ProductListFilters {
  search?: string;
  category?: string;
  barcode?: string;
  is_active?: boolean;
}

/** Checkout barcode lookup — null if nothing matches (not an error). */
export async function findProductByBarcode(barcode: string) {
  const products = await listProducts({ barcode, is_active: true });
  return products[0] ?? null;
}

export async function listProducts(filters: ProductListFilters = {}) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<ProductListEntry[]>>("pos/products/", {
    params: filters,
  });
  return data.data;
}

export async function getProduct(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<ProductDetail>>(`pos/products/${id}/`);
  return data.data;
}

export async function createProduct(input: ProductCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<ProductDetail>>("pos/products/", input);
  return data.data;
}

export async function updateProduct(id: string, input: Partial<ProductCreateInput>) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<ProductDetail>>(`pos/products/${id}/`, input);
  return data.data;
}

export async function deactivateProduct(id: string) {
  const { data } = await apiClient.delete<ApiSuccessEnvelope<null>>(`pos/products/${id}/`);
  return data;
}

export async function importProducts(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<ApiSuccessEnvelope<ProductImportResult>>(
    "pos/products/import/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}

/** Sales list is paginated (DRF's native envelope, like listInvoices — see api/envelope.ts). */
export async function listSales(filters: SaleListFilters = {}) {
  const { data } = await apiClient.get<PaginatedEnvelope<SaleListEntry>>("pos/sales/", {
    params: filters,
  });
  return data;
}

export async function getSale(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<SaleDetail>>(`pos/sales/${id}/`);
  return data.data;
}

export async function createSale(input: SaleCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<SaleDetail>>("pos/sales/", input);
  return data.data;
}

export async function getTodaySalesSummary(period: SalePeriod = "today") {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TodaySalesSummary>>("pos/sales/today-summary/", {
    params: { period },
  });
  return data.data;
}

export async function getPosAnalytics(period: SalePeriod = "today") {
  const { data } = await apiClient.get<ApiSuccessEnvelope<PosAnalytics>>("pos/sales/analytics/", {
    params: { period },
  });
  return data.data;
}

export async function getPosAnalyticsForRange(dateFrom: string, dateTo: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<PosAnalytics>>("pos/sales/analytics/", {
    params: { date_from: dateFrom, date_to: dateTo },
  });
  return data.data;
}

/** Triggers a browser download — not wrapped in useQuery, this is a one-off action. */
export async function downloadPosSalesExport(dateFrom: string, dateTo: string, format: "csv" | "xlsx" = "csv") {
  const response = await apiClient.get("pos/sales/export/", {
    params: { date_from: dateFrom, date_to: dateTo, format },
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-report-${dateFrom}-to-${dateTo}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
