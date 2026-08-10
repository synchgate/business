import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { RequirePermission } from "@/components/team/require-permission";
import { useMarkObligationDone, useObligations } from "@/hooks/use-compliance";
import { formatDate } from "@/lib/format";
import { OBLIGATION_TYPE_LABEL } from "@/types/compliance";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";

function isDueSoon(dueDay: number) {
  const today = new Date().getDate();
  const diff = dueDay - today;
  return diff >= 0 && diff <= 5;
}

export function ObligationsList() {
  const { data: obligations, isLoading, isError, refetch } = useObligations();
  const markDone = useMarkObligationDone();

  const handleMarkDone = async (id: string) => {
    try {
      await markDone.mutateAsync(id);
      toast.success("Marked as filed for this period.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update this."));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 px-5 py-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState description="Couldn't load compliance obligations." onRetry={() => refetch()} />;
  }

  if (!obligations || obligations.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No obligations tracked yet"
        description="These are seeded automatically once your tax profile is set up."
      />
    );
  }

  return (
    <Card>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Obligation</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Due day</TableHead>
              <TableHead>Last filed</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-[var(--color-ink)]">
                  {OBLIGATION_TYPE_LABEL[o.obligation_type]}
                </TableCell>
                <TableCell className="capitalize text-[var(--color-body)]">{o.frequency}</TableCell>
                <TableCell>
                  {isDueSoon(o.due_day) ? (
                    <span className="text-xs font-medium text-[var(--color-status-overdue)]">Day {o.due_day} — due soon</span>
                  ) : (
                    <span className="text-[var(--color-body)]">Day {o.due_day}</span>
                  )}
                </TableCell>
                <TableCell className="text-[var(--color-body)]">{formatDate(o.last_completed_at)}</TableCell>
                <TableCell>
                  <RequirePermission code="tax.manage">
                    <Button size="sm" variant="secondary" onClick={() => handleMarkDone(o.id)}>
                      <CheckCircle2 className="size-3.5" />
                      Mark filed
                    </Button>
                  </RequirePermission>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
