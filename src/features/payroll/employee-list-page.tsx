import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { useEmployeeList } from "@/hooks/use-payroll";
import { formatMoney } from "@/lib/format";
import { EMPLOYMENT_TYPE_LABEL } from "@/types/payroll";
import { EmployeeForm } from "@/features/payroll/employee-form";
import { PayrollTabs } from "@/features/payroll/payroll-tabs";

export function EmployeeListPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const { data: employees, isLoading, isError, refetch } = useEmployeeList({ search: search || undefined });

  return (
    <div className="space-y-6">
      <PayrollTabs />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Employees</h2>
          <p className="text-sm text-[var(--color-body)]">Manage your staff and their pay details.</p>
        </div>
        <RequirePermission code="payroll.manage_employees">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Add employee
          </Button>
        </RequirePermission>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <Input placeholder="Search employees" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load your employees." onRetry={() => refetch()} />
          ) : !employees || employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? "No matching employees" : "No employees yet"}
              description={
                search ? "Try a different search term." : "Add your first employee to start running payroll."
              }
              action={!search ? { label: "Add employee", onClick: () => setShowCreate(true) } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Base salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => navigate(`/payroll/employees/${e.id}`)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{e.full_name}</p>
                        <p className="text-xs text-[var(--color-muted)]">{e.employee_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{e.job_title}</TableCell>
                    <TableCell>
                      <Badge>{EMPLOYMENT_TYPE_LABEL[e.employment_type]}</Badge>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(e.base_salary)}</TableCell>
                    <TableCell>
                      {e.is_active ? (
                        <span className="text-xs font-medium text-[var(--color-status-paid)]">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--color-muted)]">Inactive</span>
                      )}
                    </TableCell>
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
            <DialogTitle>Add employee</DialogTitle>
            <DialogDescription>Add someone to run payroll for. You can edit their details anytime.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSuccess={() => {
              setShowCreate(false);
              refetch();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
