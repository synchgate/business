import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope, PaginatedEnvelope } from "@/api/envelope";
import type {
  CustomerCreateInput,
  CustomerDetail,
  CustomerListEntry,
  CustomerListFilters,
} from "@/types/customer";

// Customer router is registered as invoicing/customers/ based on CustomerViewSet
// registration. The url.py doesn't include it yet — but the view exists and
// this mirrors what the correct registration would expose.

export async function listCustomers(filters: CustomerListFilters = {}) {
  const { data } = await apiClient.get<PaginatedEnvelope<CustomerListEntry>>(
    "invoicing/customers/",
    { params: filters },
  );
  return data;
}

export async function getCustomer(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CustomerDetail>>(
    `invoicing/customers/${id}/`,
  );
  return data.data;
}

export async function createCustomer(input: CustomerCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<CustomerDetail>>(
    "invoicing/customers/",
    input,
  );
  return data.data;
}

export async function updateCustomer(id: string, input: Partial<CustomerCreateInput>) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<CustomerDetail>>(
    `invoicing/customers/${id}/`,
    input,
  );
  return data.data;
}

export async function deactivateCustomer(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    `invoicing/customers/${id}/deactivate/`,
  );
  return data;
}

export async function activateCustomer(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    `invoicing/customers/${id}/activate/`,
  );
  return data;
}

export async function listCustomerInvoices(customerId: string) {
  const { data } = await apiClient.get<PaginatedEnvelope<unknown>>(
    `invoicing/customers/${customerId}/invoices/`,
  );
  return data;
}

// Lightweight helper: fetch all customers for a dropdown (no pagination workaround needed
// since this just uses page_size=200 which should cover most merchants)
export async function listAllCustomers() {
  const { data } = await apiClient.get<PaginatedEnvelope<CustomerListEntry>>(
    "invoicing/customers/",
    { params: { page_size: 200 } },
  );
  return data.results ?? [];
}
