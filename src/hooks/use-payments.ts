import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listInvoicePayments, recordManualPayment } from "@/api/endpoints/payments";
import type { RecordManualPaymentInput } from "@/types/payment";

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoices", "payments", invoiceId],
    queryFn: () => listInvoicePayments(invoiceId as string),
    enabled: !!invoiceId,
  });
}

export function useRecordManualPayment(invoiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordManualPaymentInput) =>
      recordManualPayment(invoiceId, input),
    onSuccess: () => {
      // Invalidate the invoice detail so amount_paid + status refresh,
      // and the payments list so the timeline updates immediately.
      queryClient.invalidateQueries({ queryKey: ["invoices", "detail", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", "payments", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", "analytics"] });
    },
  });
}
