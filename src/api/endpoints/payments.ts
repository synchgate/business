import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type { InvoicePayment, RecordManualPaymentInput } from "@/types/payment";

export async function recordManualPayment(
  invoiceId: string,
  input: RecordManualPaymentInput,
) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<InvoicePayment>>(
    `invoicing/invoices/${invoiceId}/record-payment/`,
    input,
  );
  return data.data;
}

export async function listInvoicePayments(invoiceId: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<InvoicePayment[]>>(
    `invoicing/invoices/${invoiceId}/payments/`,
  );
  return data.data;
}
