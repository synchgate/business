// Mirrors compliance/models + compliance/serializers exactly.

export interface TaxProfile {
  id: string;
  tin: string;
  rc_number: string;
  vat_registered: boolean;
  vat_number: string;
  filing_state: string;
  fiscal_year_start_month: number;
  updated_at: string;
}

export interface TaxProfileUpdateInput {
  tin?: string;
  rc_number?: string;
  vat_registered?: boolean;
  vat_number?: string;
  filing_state?: string;
  fiscal_year_start_month?: number;
}

export type ObligationType =
  | "vat_filing"
  | "paye_remittance"
  | "cit_filing"
  | "pension_remittance"
  | "wht_remittance";

export const OBLIGATION_TYPE_LABEL: Record<ObligationType, string> = {
  vat_filing: "VAT Filing",
  paye_remittance: "PAYE Remittance",
  cit_filing: "Company Income Tax Filing",
  pension_remittance: "Pension Remittance",
  wht_remittance: "Withholding Tax Remittance",
};

export type ObligationFrequency = "monthly" | "quarterly" | "annual";

export interface ComplianceObligation {
  id: string;
  obligation_type: ObligationType;
  frequency: ObligationFrequency;
  due_day: number;
  is_active: boolean;
  last_completed_at: string | null;
  last_reminded_at: string | null;
  created_at: string;
}

export type TaxReportType = "vat" | "paye" | "cit" | "pension";

export const TAX_REPORT_TYPE_LABEL: Record<TaxReportType, string> = {
  vat: "VAT",
  paye: "PAYE",
  cit: "Company Income Tax",
  pension: "Pension",
};

export type TaxReportStatus = "generating" | "ready" | "failed";

export interface TaxReport {
  id: string;
  report_type: TaxReportType;
  period_start: string;
  period_end: string;
  total_taxable_amount: string;
  total_tax_computed: string;
  status: TaxReportStatus;
  file: string | null;
  generated_at: string;
}

export interface TaxReportGenerateInput {
  report_type: TaxReportType;
  period_start: string;
  period_end: string;
}
