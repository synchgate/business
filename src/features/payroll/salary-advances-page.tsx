import { useState } from "react";
import { HandCoins, Plus, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { useDecideSalaryAdvance, useSalaryAdvances } from "@/hooks/use-payroll";
import { usePermission } from "@/hooks/use-team";
import { formatDate, formatMoney } from "@/lib/format";
import { SALARY_ADVANCE_STATUS_LABEL, type SalaryAdvanceStatus } from "@/types/payroll";
import { SalaryAdvanceForm } from "@/features/payroll/salary-advance-form";
import { PayrollTabs } from "@/features/payroll/payroll-tabs";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";

const STATUS_TONE: Record<SalaryAdvanceStatus, string> = {
  pending: "var(--color-primary)",
  approved: "var(--color-status-paid)",
  rejected: "var(--color-status-overdue)",
  disbursed: "var(--color-status-paid)",
  repaid: "var(--color-muted)",
};

export function SalaryAdvancesPage() {
  const [showRequest, setShowRequest] = useState(false);
  const { data: advances, isLoading, isError, refetch } = useSalaryAdvances();
  const decide = useDecideSalaryAdvance();
  const canApprove = usePermission("payroll.advance.approve");

  const handleDecide = async (id: string, action: "approve" | "reject") => {
    try {
      await decide.mutateAsync({ id, action });
      toast.success(`Advance ${action}d.`);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update the request."));
    }
  };

  return (
    <div className="space-y-6">
      <PayrollTabs />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Salary advances</h2>
          <p className="text-sm text-[var(--color-body)]">
            Requests are deducted from the employee's pay automatically over the chosen repayment period.
          </p>
        </div>
        <RequirePermission code="payroll.advance.request">
          <Button onClick={() => setShowRequest(true)}>
            <Plus className="size-4" />
            Request advance
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
            <ErrorState description="Couldn't load salary advances." onRetry={() => refetch()} />
          ) : !advances || advances.length === 0 ? (
            <EmptyState icon={HandCoins} title="No advance requests" description="Salary advance requests will show up here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Repayment</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-[var(--color-ink)]">{a.employee_name}</TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(a.amount)}</TableCell>
                    <TableCell className="text-[var(--color-body)]">
                      {formatMoney(a.monthly_deduction)}/mo × {a.repayment_months}
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(a.balance)}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: `color-mix(in srgb, ${STATUS_TONE[a.status]} 14%, transparent)`,
                          color: STATUS_TONE[a.status],
                        }}
                      >
                        {SALARY_ADVANCE_STATUS_LABEL[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatDate(a.created_at)}</TableCell>
                    <TableCell>
                      {canApprove && a.status === "pending" && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => handleDecide(a.id, "approve")}>
                            <Check className="size-3.5" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDecide(a.id, "reject")}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request salary advance</DialogTitle>
            <DialogDescription>An owner or admin will review this request.</DialogDescription>
          </DialogHeader>
          <SalaryAdvanceForm
            onSuccess={() => {
              setShowRequest(false);
              refetch();
            }}
            onCancel={() => setShowRequest(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
