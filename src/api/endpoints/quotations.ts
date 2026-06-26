import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope, PaginatedEnvelope } from "@/api/envelope";
import type {
  QuotationCreateInput,
  QuotationConvertInput,
  QuotationDetail,
  QuotationListEntry,
  QuotationListFilters,
} from "@/types/quotation";
import type { InvoiceDetail } from "@/types/invoice";

// Mirrors invoicing/urls.py QuotationViewSet routes exactly.

export async function listQuotations(filters: QuotationListFilters = {}) {
  const { data } = await apiClient.get<PaginatedEnvelope<QuotationListEntry>>(
    "invoicing/quotes/",
    { params: filters },
  );
  return data;
}

export async function getQuotation(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<QuotationDetail>>(
    `invoicing/quotes/${id}/`,
  );
  return data.data;
}

export async function createQuotation(input: QuotationCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<QuotationDetail>>(
    "invoicing/quotes/",
    input,
  );
  return data.data;
}

export async function updateQuotation(id: string, input: Partial<QuotationCreateInput>) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<QuotationDetail>>(
    `invoicing/quotes/${id}/`,
    input,
  );
  return data.data;
}

export async function sendQuotation(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<QuotationDetail>>(
    `invoicing/quotes/${id}/send/`,
  );
  return data.data;
}

export async function cancelQuotation(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    `invoicing/quotes/${id}/cancel/`,
  );
  return data;
}

export async function convertQuotation(id: string, input: QuotationConvertInput) {
  const { data } = await apiClient.post<
    ApiSuccessEnvelope<{ invoice: InvoiceDetail; quotation: QuotationDetail }>
  >(`invoicing/quotes/${id}/convert/`, input);
  return data.data;
}

// ── Public (no auth) ─────────────────────────────────────────────

export async function getPublicQuotation(quoteNumber: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<QuotationDetail>>(
    `invoicing/quotes/public/${quoteNumber}/`,
  );
  return data.data;
}

export async function respondToQuotation(
  quoteNumber: string,
  decision: "accepted" | "rejected",
  customerNote?: string,
) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<QuotationDetail>>(
    `invoicing/quotes/public/${quoteNumber}/respond/`,
    { decision, customer_note: customerNote ?? "" },
  );
  return data.data;
}
