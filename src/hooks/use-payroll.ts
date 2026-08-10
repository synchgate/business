import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approvePayrollRun,
  createEmployee,
  createPayrollRun,
  deactivateEmployee,
  decideSalaryAdvance,
  disbursePayrollRun,
  getEmployee,
  getPayrollRun,
  listEmployees,
  listPayrollRuns,
  listSalaryAdvances,
  requestSalaryAdvance,
  submitPayrollRun,
  updateEmployee,
  type EmployeeListFilters,
} from "@/api/endpoints/payroll";
import type { EmployeeCreateInput, PayrollRunCreateInput, SalaryAdvanceCreateInput } from "@/types/payroll";

function useInvalidate(key: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [key] });
}

// ── Employees ────────────────────────────────────────────────────────

export function useEmployeeList(filters: EmployeeListFilters = {}) {
  return useQuery({ queryKey: ["payroll", "employees", filters], queryFn: () => listEmployees(filters) });
}

export function useEmployeeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "employees", "detail", id],
    queryFn: () => getEmployee(id as string),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (input: EmployeeCreateInput) => createEmployee(input), onSuccess: invalidate });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidate("payroll");
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmployeeCreateInput> }) => updateEmployee(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateEmployee() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (id: string) => deactivateEmployee(id), onSuccess: invalidate });
}

// ── Payroll runs ─────────────────────────────────────────────────────

export function usePayrollRuns() {
  return useQuery({ queryKey: ["payroll", "runs"], queryFn: listPayrollRuns });
}

export function usePayrollRunDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "runs", id],
    queryFn: () => getPayrollRun(id as string),
    enabled: !!id,
    // Poll while a run is mid-disbursement so payslip statuses update live.
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 4000 : false),
  });
}

export function useCreatePayrollRun() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (input: PayrollRunCreateInput) => createPayrollRun(input), onSuccess: invalidate });
}

export function useSubmitPayrollRun() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (id: string) => submitPayrollRun(id), onSuccess: invalidate });
}

export function useApprovePayrollRun() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (id: string) => approvePayrollRun(id), onSuccess: invalidate });
}

export function useDisbursePayrollRun() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (id: string) => disbursePayrollRun(id), onSuccess: invalidate });
}

// ── Salary advances ──────────────────────────────────────────────────

export function useSalaryAdvances(status?: string) {
  return useQuery({ queryKey: ["payroll", "advances", status], queryFn: () => listSalaryAdvances(status) });
}

export function useRequestSalaryAdvance() {
  const invalidate = useInvalidate("payroll");
  return useMutation({ mutationFn: (input: SalaryAdvanceCreateInput) => requestSalaryAdvance(input), onSuccess: invalidate });
}

export function useDecideSalaryAdvance() {
  const invalidate = useInvalidate("payroll");
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) => decideSalaryAdvance(id, action),
    onSuccess: invalidate,
  });
}
