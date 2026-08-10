import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateTaxReport,
  getTaxProfile,
  listObligations,
  listTaxReports,
  markObligationDone,
  updateObligation,
  updateTaxProfile,
} from "@/api/endpoints/compliance";
import type { TaxProfileUpdateInput, TaxReportGenerateInput } from "@/types/compliance";

function useInvalidate(key: string[]) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: key });
}

export function useTaxProfile() {
  return useQuery({ queryKey: ["compliance", "profile"], queryFn: getTaxProfile });
}

export function useUpdateTaxProfile() {
  const invalidate = useInvalidate(["compliance", "profile"]);
  return useMutation({ mutationFn: (input: TaxProfileUpdateInput) => updateTaxProfile(input), onSuccess: invalidate });
}

export function useObligations() {
  return useQuery({ queryKey: ["compliance", "obligations"], queryFn: listObligations });
}

export function useUpdateObligation() {
  const invalidate = useInvalidate(["compliance", "obligations"]);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { due_day?: number; is_active?: boolean } }) =>
      updateObligation(id, input),
    onSuccess: invalidate,
  });
}

export function useMarkObligationDone() {
  const invalidate = useInvalidate(["compliance", "obligations"]);
  return useMutation({ mutationFn: (id: string) => markObligationDone(id), onSuccess: invalidate });
}

export function useTaxReports(reportType?: string) {
  return useQuery({ queryKey: ["compliance", "reports", reportType], queryFn: () => listTaxReports(reportType) });
}

export function useGenerateTaxReport() {
  const invalidate = useInvalidate(["compliance", "reports"]);
  return useMutation({ mutationFn: (input: TaxReportGenerateInput) => generateTaxReport(input), onSuccess: invalidate });
}
