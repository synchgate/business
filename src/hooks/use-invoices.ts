import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvoice,
  createInvoice,
  deleteInvoice,
  getInvoice,
  getInvoiceAnalytics,
  getInvoiceReceipt,
  listInvoices,
  remindInvoice,
  sendInvoice,
  updateInvoice,
} from "@/api/endpoints/invoices";
import type { InvoiceCreateInput, InvoiceListFilters } from "@/types/invoice";

export function useInvoiceAnalytics() {
  return useQuery({ queryKey: ["invoices", "analytics"], queryFn: getInvoiceAnalytics });
}

export function useInvoiceList(filters: InvoiceListFilters) {
  return useQuery({
    queryKey: ["invoices", "list", filters],
    queryFn: () => listInvoices(filters),
  });
}

export function useInvoiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["invoices", "detail", id],
    queryFn: () => getInvoice(id as string),
    enabled: !!id,
  });
}

export function useInvoiceReceipt(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["invoices", "receipt", id],
    queryFn: () => getInvoiceReceipt(id as string),
    enabled: !!id && enabled,
    retry: false,
  });
}

function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };
}

export function useCreateInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (input: InvoiceCreateInput) => createInvoice(input),
    onSuccess: invalidate,
  });
}

export function useUpdateInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InvoiceCreateInput> }) => updateInvoice(id, input),
    onSuccess: invalidate,
  });
}

export function useSendInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: string) => sendInvoice(id),
    onSuccess: invalidate,
  });
}

export function useRemindInvoice() {
  return useMutation({ mutationFn: (id: string) => remindInvoice(id) });
}

export function useCancelInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: invalidate,
  });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: invalidate,
  });
}
