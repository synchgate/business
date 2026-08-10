import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { usePayrollRuns } from "@/hooks/use-payroll";
import { formatDate, formatMoney } from "@/lib/format";
import { PAYROLL_RUN_STATUS_LABEL, type PayrollRunStatus } from "@/types/payroll";
import { PayrollRunCreateForm } from "@/features/payroll/payroll-run-create-form";
import { PayrollTabs } from "@/features/payroll/payroll-tabs";

const STATUS_TONE: Record<PayrollRunStatus, string> = {
  draft: "var(--color-muted)",
  pending_approval: "var(--color-primary)",
  approved: "var(--color-primary)",
  processing: "var(--color-primary)",
  paid: "var(--color-status-paid)",
  failed: "var(--color-status-overdue)",
  cancelled: "var(--color-muted)",
};

export function PayrollRunListPage() {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const { data: runs, isLoading, isError, refetch } = usePayrollRuns();

  return (
    <div className="space-y-6">
      <PayrollTabs />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Payroll runs</h2>
          <p className="text-sm text-[var(--color-body)]">Run payroll, review payslips, and track disbursement.</p>
        </div>
        <RequirePermission code="payroll.run">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            New payroll run
          </Button>
        </RequirePermission>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load payroll runs." onRetry={() => refetch()} />
          ) : !runs || runs.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payroll runs yet"
              description="Create your first payroll run to pay your team."
              action={{ label: "New payroll run", onClick: () => setShowCreate(true) }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id} className="cursor-pointer" onClick={() => navigate(`/payroll/runs/${run.id}`)}>
                    <TableCell className="font-medium text-[var(--color-ink)]">
                      {formatDate(run.period_start)} – {formatDate(run.period_end)}
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{run.employee_count}</TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(run.total_gross)}</TableCell>
                    <TableCell className="font-medium text-[var(--color-ink)]">{formatMoney(run.total_net)}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: `color-mix(in srgb, ${STATUS_TONE[run.status]} 14%, transparent)`,
                          color: STATUS_TONE[run.status],
                        }}
                      >
                        {PAYROLL_RUN_STATUS_LABEL[run.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatDate(run.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New payroll run</DialogTitle>
            <DialogDescription>Choose the pay period to generate payslips for.</DialogDescription>
          </DialogHeader>
          <PayrollRunCreateForm onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
