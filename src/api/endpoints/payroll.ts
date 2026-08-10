import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type {
  EmployeeCreateInput,
  EmployeeDetail,
  EmployeeListEntry,
  PayrollRunCreateInput,
  PayrollRunDetail,
  PayrollRunListEntry,
  SalaryAdvance,
  SalaryAdvanceCreateInput,
} from "@/types/payroll";

// Mirrors payroll/urls.py + payroll/views/*.py exactly.

export interface EmployeeListFilters {
  search?: string;
  is_active?: boolean;
}

export async function listEmployees(filters: EmployeeListFilters = {}) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<EmployeeListEntry[]>>("payroll/employees/", {
    params: filters,
  });
  return data.data;
}

export async function getEmployee(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<EmployeeDetail>>(`payroll/employees/${id}/`);
  return data.data;
}

export async function createEmployee(input: EmployeeCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<EmployeeDetail>>("payroll/employees/", input);
  return data.data;
}

export async function updateEmployee(id: string, input: Partial<EmployeeCreateInput>) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<EmployeeDetail>>(
    `payroll/employees/${id}/`,
    input,
  );
  return data.data;
}

export async function deactivateEmployee(id: string) {
  const { data } = await apiClient.delete<ApiSuccessEnvelope<null>>(`payroll/employees/${id}/`);
  return data;
}

export async function listPayrollRuns() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<PayrollRunListEntry[]>>("payroll/runs/");
  return data.data;
}

export async function getPayrollRun(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<PayrollRunDetail>>(`payroll/runs/${id}/`);
  return data.data;
}

export async function createPayrollRun(input: PayrollRunCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<PayrollRunDetail>>("payroll/runs/", input);
  return data.data;
}

export async function submitPayrollRun(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<PayrollRunDetail>>(`payroll/runs/${id}/submit/`);
  return data.data;
}

export async function approvePayrollRun(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<PayrollRunDetail>>(`payroll/runs/${id}/approve/`);
  return data.data;
}

export async function disbursePayrollRun(id: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<PayrollRunDetail>>(`payroll/runs/${id}/disburse/`);
  return data.data;
}

export async function listSalaryAdvances(status?: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<SalaryAdvance[]>>("payroll/advances/", {
    params: status ? { status } : undefined,
  });
  return data.data;
}

export async function requestSalaryAdvance(input: SalaryAdvanceCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<SalaryAdvance>>("payroll/advances/", input);
  return data.data;
}

export async function decideSalaryAdvance(id: string, action: "approve" | "reject") {
  const { data } = await apiClient.post<ApiSuccessEnvelope<SalaryAdvance>>(`payroll/advances/${id}/decide/`, {
    action,
  });
  return data.data;
}
