import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { RequirePermission } from "@/components/team/require-permission";
import {
  useApprovePayrollRun,
  useDisbursePayrollRun,
  usePayrollRunDetail,
  useSubmitPayrollRun,
} from "@/hooks/use-payroll";
import { formatDate, formatMoney } from "@/lib/format";
import { PAYROLL_RUN_STATUS_LABEL, type PayrollRunStatus, type PayslipStatus } from "@/types/payroll";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";

const STATUS_TONE: Record<PayrollRunStatus, string> = {
  draft: "var(--color-muted)",
  pending_approval: "var(--color-primary)",
  approved: "var(--color-primary)",
  processing: "var(--color-primary)",
  paid: "var(--color-status-paid)",
  failed: "var(--color-status-overdue)",
  cancelled: "var(--color-muted)",
};

const PAYSLIP_STATUS_TONE: Record<PayslipStatus, string> = {
  pending: "var(--color-muted)",
  paid: "var(--color-status-paid)",
  failed: "var(--color-status-overdue)",
};

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="font-display text-base font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

export function PayrollRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: run, isLoading, isError, refetch } = usePayrollRunDetail(id);

  const submitRun = useSubmitPayrollRun();
  const approveRun = useApprovePayrollRun();
  const disburseRun = useDisbursePayrollRun();

  const handleAction = async (
    action: typeof submitRun | typeof approveRun | typeof disburseRun,
    successMessage: string,
  ) => {
    if (!id) return;
    try {
      await action.mutateAsync(id);
      toast.success(successMessage);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "That action failed."));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !run) {
    return <ErrorState description="Couldn't load this payroll run." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/payroll/runs")}>
          <ArrowLeft className="size-4" />
          Back to payroll runs
        </Button>

        <div className="flex gap-2">
          {run.status === "draft" && (
            <RequirePermission code="payroll.run">
              <Button onClick={() => handleAction(submitRun, "Submitted for approval.")} disabled={submitRun.isPending}>
                <Send className="size-4" />
                Submit for approval
              </Button>
            </RequirePermission>
          )}
          {run.status === "pending_approval" && (
            <RequirePermission code="payroll.approve">
              <Button onClick={() => handleAction(approveRun, "Payroll run approved.")} disabled={approveRun.isPending}>
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
            </RequirePermission>
          )}
          {run.status === "approved" && (
            <RequirePermission code="payroll.approve">
              <Button onClick={() => handleAction(disburseRun, "Disbursement started.")} disabled={disburseRun.isPending}>
                <Banknote className="size-4" />
                Disburse
              </Button>
            </RequirePermission>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          {formatDate(run.period_start)} – {formatDate(run.period_end)}
        </h2>
        <Badge
          style={{
            backgroundColor: `color-mix(in srgb, ${STATUS_TONE[run.status]} 14%, transparent)`,
            color: STATUS_TONE[run.status],
          }}
        >
          {PAYROLL_RUN_STATUS_LABEL[run.status]}
        </Badge>
      </div>

      {run.status === "processing" && (
        <p className="text-sm text-[var(--color-muted)]">
          Disbursement in progress — this page updates automatically as payslips settle.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <SummaryStat label="Gross pay" value={formatMoney(run.total_gross)} />
          <SummaryStat label="PAYE tax" value={formatMoney(run.total_paye_tax)} />
          <SummaryStat label="Pension" value={formatMoney(run.total_pension)} />
          <SummaryStat label="Other deductions" value={formatMoney(run.total_other_deductions)} />
          <SummaryStat label="Net pay" value={formatMoney(run.total_net)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payslips ({run.payslips.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>PAYE</TableHead>
                <TableHead>Pension</TableHead>
                <TableHead>Net pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.payslips.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{p.employee_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{p.employee_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-body)]">{formatMoney(p.gross_pay)}</TableCell>
                  <TableCell className="text-[var(--color-body)]">{formatMoney(p.paye_tax)}</TableCell>
                  <TableCell className="text-[var(--color-body)]">{formatMoney(p.pension_deduction)}</TableCell>
                  <TableCell className="font-medium text-[var(--color-ink)]">{formatMoney(p.net_pay)}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2 py-0.5 text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${PAYSLIP_STATUS_TONE[p.status]} 14%, transparent)`,
                        color: PAYSLIP_STATUS_TONE[p.status],
                      }}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: PAYSLIP_STATUS_TONE[p.status] }} />
                      {p.status}
                    </span>
                    {p.status === "failed" && p.failure_reason && (
                      <p className="mt-0.5 text-xs text-[var(--color-status-overdue)]">{p.failure_reason}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
