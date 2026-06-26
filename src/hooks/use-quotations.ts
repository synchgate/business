import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelQuotation,
  convertQuotation,
  createQuotation,
  getQuotation,
  listQuotations,
  sendQuotation,
  updateQuotation,
} from "@/api/endpoints/quotations";
import type { QuotationConvertInput, QuotationCreateInput, QuotationListFilters } from "@/types/quotation";

function useInvalidateQuotations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["quotations"] });
}

export function useQuotationList(filters: QuotationListFilters) {
  return useQuery({
    queryKey: ["quotations", "list", filters],
    queryFn: () => listQuotations(filters),
  });
}

export function useQuotationDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["quotations", "detail", id],
    queryFn: () => getQuotation(id as string),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (input: QuotationCreateInput) => createQuotation(input),
    onSuccess: invalidate,
  });
}

export function useUpdateQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<QuotationCreateInput> }) =>
      updateQuotation(id, input),
    onSuccess: invalidate,
  });
}

export function useSendQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (id: string) => sendQuotation(id),
    onSuccess: invalidate,
  });
}

export function useCancelQuotation() {
  const invalidate = useInvalidateQuotations();
  return useMutation({
    mutationFn: (id: string) => cancelQuotation(id),
    onSuccess: invalidate,
  });
}

export function useConvertQuotation() {
  const invalidate = useInvalidateQuotations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: QuotationConvertInput }) =>
      convertQuotation(id, input),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
