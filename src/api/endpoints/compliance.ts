import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type {
  ComplianceObligation,
  TaxProfile,
  TaxProfileUpdateInput,
  TaxReport,
  TaxReportGenerateInput,
} from "@/types/compliance";

// Mirrors compliance/urls.py + compliance/views/*.py exactly.

export async function getTaxProfile() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TaxProfile>>("compliance/profile/");
  return data.data;
}

export async function updateTaxProfile(input: TaxProfileUpdateInput) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<TaxProfile>>("compliance/profile/", input);
  return data.data;
}

export async function listObligations() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<ComplianceObligation[]>>("compliance/obligations/");
  return data.data;
}

export async function updateObligation(id: string, input: { due_day?: number; is_active?: boolean }) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<ComplianceObligation>>(
    `compliance/obligations/${id}/`,
    input,
  );
  return data.data;
}

export async function markObligationDone(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<ComplianceObligation>>(
    `compliance/obligations/${id}/mark-done/`,
  );
  return data.data;
}

export async function listTaxReports(reportType?: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TaxReport[]>>("compliance/reports/", {
    params: reportType ? { report_type: reportType } : undefined,
  });
  return data.data;
}

export async function generateTaxReport(input: TaxReportGenerateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<TaxReport>>("compliance/reports/", input);
  return data.data;
}
