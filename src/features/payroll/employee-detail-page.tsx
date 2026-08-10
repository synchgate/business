import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { useDeactivateEmployee, useEmployeeDetail } from "@/hooks/use-payroll";
import { formatDate, formatMoney } from "@/lib/format";
import { EMPLOYMENT_TYPE_LABEL } from "@/types/payroll";
import { EmployeeForm } from "@/features/payroll/employee-form";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="text-sm text-[var(--color-ink)]">{value || "—"}</p>
    </div>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, isError, refetch } = useEmployeeDetail(id);
  const deactivate = useDeactivateEmployee();
  const [showEdit, setShowEdit] = useState(false);

  const handleDeactivate = async () => {
    if (!employee) return;
    try {
      await deactivate.mutateAsync(employee.id);
      toast.success("Employee deactivated.");
      refetch();
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't deactivate employee."));
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

  if (isError || !employee) {
    return <ErrorState description="Couldn't load this employee." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/payroll/employees")}>
          <ArrowLeft className="size-4" />
          Back to employees
        </Button>
        <RequirePermission code="payroll.manage_employees">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            {employee.is_active && (
              <Button variant="destructive" onClick={handleDeactivate}>
                <UserX className="size-4" />
                Deactivate
              </Button>
            )}
          </div>
        </RequirePermission>
      </div>

      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">{employee.full_name}</h2>
        <Badge>{EMPLOYMENT_TYPE_LABEL[employee.employment_type]}</Badge>
        {!employee.is_active && <Badge className="bg-[var(--color-status-overdue)]/10 text-[var(--color-status-overdue)]">Inactive</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Employee ID" value={employee.employee_id} />
          <Field label="Job title" value={employee.job_title} />
          <Field label="Department" value={employee.department} />
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phone} />
          <Field label="Pay frequency" value={employee.pay_frequency} />
          <Field label="Base salary" value={formatMoney(employee.base_salary)} />
          <Field label="Start date" value={formatDate(employee.start_date)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout & tax details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Bank name" value={employee.bank_name} />
          <Field label="Account number" value={employee.bank_account_number} />
          <Field label="Account name" value={employee.bank_account_name} />
          <Field label="TIN" value={employee.tin} />
          <Field label="Pension PIN" value={employee.pension_pin} />
        </CardContent>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Update {employee.full_name}'s details.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            existing={employee}
            onSuccess={() => {
              setShowEdit(false);
              refetch();
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
