import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateCustomer,
  createCustomer,
  deactivateCustomer,
  getCustomer,
  listAllCustomers,
  listCustomers,
  listCustomerInvoices,
  updateCustomer,
} from "@/api/endpoints/customers";
import type { CustomerCreateInput, CustomerListFilters } from "@/types/customer";

export function useCustomerList(filters: CustomerListFilters = {}) {
  return useQuery({
    queryKey: ["customers", "list", filters],
    queryFn: () => listCustomers(filters),
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => getCustomer(id as string),
    enabled: !!id,
  });
}

export function useCustomerInvoices(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", "invoices", id],
    queryFn: () => listCustomerInvoices(id as string),
    enabled: !!id,
  });
}

// For invoice create/edit dropdowns — fetches all customers without pagination
export function useAllCustomers() {
  return useQuery({
    queryKey: ["customers", "all"],
    queryFn: listAllCustomers,
    staleTime: 60_000,
  });
}

function useInvalidateCustomers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["customers"] });
}

export function useCreateCustomer() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (input: CustomerCreateInput) => createCustomer(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCustomer() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CustomerCreateInput> }) =>
      updateCustomer(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateCustomer() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (id: string) => deactivateCustomer(id),
    onSuccess: invalidate,
  });
}

export function useActivateCustomer() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (id: string) => activateCustomer(id),
    onSuccess: invalidate,
  });
}
