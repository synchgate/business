import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";
import { useChangeTeamMemberStatus, useIsOwnerOrAdmin, useTeamMembers, useUpdateTeamMemberRole } from "@/hooks/use-team";
import { formatDate } from "@/lib/format";
import { ASSIGNABLE_ROLES, ROLE_LABEL, type TeamRole } from "@/types/team";

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

const STATUS_TONE: Record<string, string> = {
  active: "var(--color-status-paid)",
  invited: "var(--color-muted)",
  suspended: "var(--color-status-overdue)",
  removed: "var(--color-muted)",
};

export function MembersList() {
  const { data: members, isLoading, isError, refetch } = useTeamMembers();
  const canManage = useIsOwnerOrAdmin();
  const updateRole = useUpdateTeamMemberRole();
  const changeStatus = useChangeTeamMemberStatus();

  const handleRoleChange = async (id: string, role: TeamRole) => {
    try {
      await updateRole.mutateAsync({ id, input: { role } });
      toast.success("Role updated.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update role."));
    }
  };

  const handleStatusChange = async (id: string, action: "suspend" | "activate" | "remove") => {
    try {
      await changeStatus.mutateAsync({ id, action });
      toast.success(`Team member ${action}d.`);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update team member."));
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
    return <ErrorState description="Couldn't load your team." onRetry={() => refetch()} />;
  }

  if (!members || members.length === 0) {
    return <EmptyState icon={Users} title="No team members yet" description="Invite someone to get started." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(m.first_name, m.last_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    {m.first_name} {m.last_name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{m.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {canManage && m.role !== "owner" ? (
                <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v as TeamRole)}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="capitalize">{ROLE_LABEL[m.role]}</Badge>
              )}
            </TableCell>
            <TableCell>
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${STATUS_TONE[m.status]} 14%, transparent)`,
                  color: STATUS_TONE[m.status],
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_TONE[m.status] }} />
                {m.status}
              </span>
            </TableCell>
            <TableCell className="text-[var(--color-body)]">{formatDate(m.joined_at)}</TableCell>
            <TableCell>
              {canManage && m.role !== "owner" && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="rounded-[var(--radius-chip)] p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]">
                      <MoreVertical className="size-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      className="z-50 min-w-40 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-lg"
                    >
                      {m.status !== "suspended" ? (
                        <DropdownMenu.Item
                          onSelect={() => handleStatusChange(m.id, "suspend")}
                          className="cursor-pointer rounded-[var(--radius-chip)] px-2.5 py-2 text-sm text-[var(--color-body)] outline-none hover:bg-[var(--color-surface-muted)]"
                        >
                          Suspend
                        </DropdownMenu.Item>
                      ) : (
                        <DropdownMenu.Item
                          onSelect={() => handleStatusChange(m.id, "activate")}
                          className="cursor-pointer rounded-[var(--radius-chip)] px-2.5 py-2 text-sm text-[var(--color-body)] outline-none hover:bg-[var(--color-surface-muted)]"
                        >
                          Reactivate
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Item
                        onSelect={() => handleStatusChange(m.id, "remove")}
                        className="cursor-pointer rounded-[var(--radius-chip)] px-2.5 py-2 text-sm text-[var(--color-status-overdue)] outline-none hover:bg-[var(--color-surface-muted)]"
                      >
                        Remove from team
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
