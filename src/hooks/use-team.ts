import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptTeamInvite,
  changeTeamMemberStatus,
  createTeamInvite,
  getActiveMembership,
  listTeamInvites,
  listTeamMembers,
  revokeTeamInvite,
  updateTeamMemberRole,
} from "@/api/endpoints/team";
import type { TeamInviteCreateInput, TeamMemberUpdateInput } from "@/types/team";

// The caller's own membership on the active business — role + resolved
// permission codes. Every permission-gated action in the app (payroll
// approval, tax report generation, inviting teammates, etc.) reads from
// this rather than re-deriving permission logic client-side.
export function useActiveMembership() {
  return useQuery({
    queryKey: ["team", "me"],
    queryFn: getActiveMembership,
    staleTime: 60_000,
  });
}

/**
 * `usePermission("payroll.run")` → boolean. Returns false (not undefined)
 * while loading, so gated buttons default to hidden/disabled rather than
 * flashing visible before the permission check resolves.
 */
export function usePermission(code: string) {
  const { data } = useActiveMembership();
  return !!data?.permissions.includes(code);
}

export function useIsOwnerOrAdmin() {
  const { data } = useActiveMembership();
  return data?.role === "owner" || data?.role === "admin";
}

function useInvalidateTeam() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["team"] });
}

export function useTeamMembers() {
  return useQuery({ queryKey: ["team", "members"], queryFn: listTeamMembers });
}

export function useUpdateTeamMemberRole() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TeamMemberUpdateInput }) =>
      updateTeamMemberRole(id, input),
    onSuccess: invalidate,
  });
}

export function useChangeTeamMemberStatus() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "suspend" | "activate" | "remove" }) =>
      changeTeamMemberStatus(id, action),
    onSuccess: invalidate,
  });
}

export function useTeamInvites() {
  return useQuery({ queryKey: ["team", "invites"], queryFn: listTeamInvites });
}

export function useCreateTeamInvite() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: (input: TeamInviteCreateInput) => createTeamInvite(input),
    onSuccess: invalidate,
  });
}

export function useRevokeTeamInvite() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: (id: string) => revokeTeamInvite(id),
    onSuccess: invalidate,
  });
}

export function useAcceptTeamInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptTeamInvite(token),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
