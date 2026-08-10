import { Mail, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";
import { useIsOwnerOrAdmin, useRevokeTeamInvite, useTeamInvites } from "@/hooks/use-team";
import { formatDate } from "@/lib/format";
import { ROLE_LABEL } from "@/types/team";

const STATUS_TONE: Record<string, string> = {
  pending: "var(--color-primary)",
  accepted: "var(--color-status-paid)",
  expired: "var(--color-muted)",
  revoked: "var(--color-status-overdue)",
};

export function InvitesList() {
  const { data: invites, isLoading, isError, refetch } = useTeamInvites();
  const canManage = useIsOwnerOrAdmin();
  const revoke = useRevokeTeamInvite();

  const handleRevoke = async (id: string) => {
    try {
      await revoke.mutateAsync(id);
      toast.success("Invite revoked.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't revoke the invite."));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 px-5 py-5">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState description="Couldn't load invites." onRetry={() => refetch()} />;
  }

  if (!invites || invites.length === 0) {
    return <EmptyState icon={Mail} title="No invites yet" description="Sent invites will show up here." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium text-[var(--color-ink)]">{inv.email}</TableCell>
            <TableCell>
              <Badge className="capitalize">{ROLE_LABEL[inv.role]}</Badge>
            </TableCell>
            <TableCell>
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2 py-0.5 text-xs font-medium capitalize"
                style={{
                  backgroundColor: `color-mix(in srgb, ${STATUS_TONE[inv.status]} 14%, transparent)`,
                  color: STATUS_TONE[inv.status],
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_TONE[inv.status] }} />
                {inv.status}
              </span>
            </TableCell>
            <TableCell className="text-[var(--color-body)]">{formatDate(inv.created_at)}</TableCell>
            <TableCell className="text-[var(--color-body)]">{formatDate(inv.expires_at)}</TableCell>
            <TableCell>
              {canManage && inv.status === "pending" && (
                <Button size="sm" variant="ghost" onClick={() => handleRevoke(inv.id)}>
                  <X className="size-4" />
                  Revoke
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
