import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope, PaginatedEnvelope } from "@/api/envelope";
import type {
  InvoiceCreateInput,
  InvoiceDetail,
  InvoiceListEntry,
  InvoiceListFilters,
  InvoiceAnalytics,
  Receipt,
} from "@/types/invoice";

// Mirrors invoicing/urls.py + invoicing/views/invoice.py exactly.
//
// Note the list endpoint is the one place the backend returns DRF's native
// pagination envelope instead of the {status,message,data,meta} wrapper used
// everywhere else (see api/envelope.ts for why) — handled here so call sites
// never have to think about it.

export async function listInvoices(filters: InvoiceListFilters = {}) {
  const { data } = await apiClient.get<PaginatedEnvelope<InvoiceListEntry>>(
    "invoicing/invoices/",
    { params: filters },
  );
  return data;
}

export async function getInvoice(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<InvoiceDetail>>(
    `invoicing/invoices/${id}/`,
  );
  return data.data;
}

export async function createInvoice(input: InvoiceCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<InvoiceDetail>>(
    "invoicing/invoices/",
    input,
  );
  return data.data;
}

export async function sendInvoice(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<InvoiceDetail>>(
    `invoicing/invoices/${id}/send/`,
  );
  return data.data;
}

export async function remindInvoice(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    `invoicing/invoices/${id}/remind/`,
  );
  return data;
}

export async function cancelInvoice(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    `invoicing/invoices/${id}/cancel/`,
  );
  return data;
}

export async function getInvoiceReceipt(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<Receipt>>(
    `invoicing/invoices/${id}/receipt/`,
  );
  return data.data;
}

export async function getInvoiceAnalytics() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<InvoiceAnalytics>>(
    "invoicing/invoices/analytics/",
  );
  return data.data;
}

export async function getPublicInvoice(invoiceNumber: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<InvoiceDetail>>(
    `invoicing/pay/${invoiceNumber}/`,
  );
  return data.data;
}

// ── Not live on the backend yet (implementation plan, gap #1) ──────────────
// These call the REST-conventional routes a PATCH/DELETE mixin would expose
// on InvoiceViewSet. They're wired up end-to-end on the frontend now so the
// Edit/Delete UI works the moment the backend adds the routes; until then
// they 404/405, which the UI surfaces as "not available yet" rather than a
// raw error. See useInvoiceMutations for the catch handling.

export async function updateInvoice(id: string, input: Partial<InvoiceCreateInput>) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<InvoiceDetail>>(
    `invoicing/invoices/${id}/`,
    input,
  );
  return data.data;
}

export async function deleteInvoice(id: string) {
  await apiClient.delete(`invoicing/invoices/${id}/`);
}
