// Mirrors payroll/models + payroll/serializers exactly.

export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";
export type PayFrequency = "monthly" | "weekly" | "biweekly";

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export interface EmployeeListEntry {
  id: string;
  employee_id: string;
  full_name: string;
  job_title: string;
  department: string;
  employment_type: EmploymentType;
  base_salary: string;
  is_active: boolean;
  start_date: string;
}

export interface EmployeeDetail extends EmployeeListEntry {
  email: string;
  phone: string;
  pay_frequency: PayFrequency;
  bank_name: string;
  bank_code: string;
  bank_account_number: string;
  bank_account_name: string;
  tin: string;
  pension_pin: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreateInput {
  full_name: string;
  email?: string;
  phone?: string;
  job_title: string;
  department?: string;
  employment_type: EmploymentType;
  pay_frequency: PayFrequency;
  base_salary: number;
  bank_name?: string;
  bank_code?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  tin?: string;
  pension_pin?: string;
  start_date: string;
}

export type PayrollRunStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export const PAYROLL_RUN_STATUS_LABEL: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

export type PayslipStatus = "pending" | "paid" | "failed";

export interface Payslip {
  id: string;
  employee: string;
  employee_name: string;
  employee_code: string;
  gross_pay: string;
  paye_tax: string;
  pension_deduction: string;
  other_deductions: string;
  bonuses: string;
  net_pay: string;
  status: PayslipStatus;
  payment_reference: string;
  failure_reason: string;
  paid_at: string | null;
}

export interface PayrollRunListEntry {
  id: string;
  period_start: string;
  period_end: string;
  status: PayrollRunStatus;
  total_gross: string;
  total_net: string;
  employee_count: number;
  created_at: string;
}

export interface PayrollRunDetail {
  id: string;
  period_start: string;
  period_end: string;
  status: PayrollRunStatus;
  total_gross: string;
  total_paye_tax: string;
  total_pension: string;
  total_other_deductions: string;
  total_net: string;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  notes: string;
  payslips: Payslip[];
  created_at: string;
}

export interface PayrollRunCreateInput {
  period_start: string;
  period_end: string;
  employee_ids?: string[];
}

export type SalaryAdvanceStatus = "pending" | "approved" | "rejected" | "disbursed" | "repaid";

export const SALARY_ADVANCE_STATUS_LABEL: Record<SalaryAdvanceStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
  repaid: "Repaid",
};

export interface SalaryAdvance {
  id: string;
  employee: string;
  employee_name: string;
  amount: string;
  reason: string;
  repayment_months: number;
  amount_repaid: string;
  monthly_deduction: string;
  balance: string;
  status: SalaryAdvanceStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface SalaryAdvanceCreateInput {
  employee: string;
  amount: number;
  reason?: string;
  repayment_months: number;
}
