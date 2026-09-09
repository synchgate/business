import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type {
  TeamMember,
  TeamMemberDetail,
  TeamMemberUpdateInput,
  TeamInvite,
  TeamInviteCreateInput,
} from "@/types/team";

// Mirrors teams/urls.py + teams/views/*.py exactly.

export async function getActiveMembership() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TeamMemberDetail>>("teams/members/me/");
  return data.data;
}

export async function listTeamMembers() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TeamMember[]>>("teams/members/");
  return data.data;
}

export async function getTeamMember(id: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TeamMemberDetail>>(`teams/members/${id}/`);
  return data.data;
}

export async function updateTeamMemberRole(id: string, input: TeamMemberUpdateInput) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<TeamMemberDetail>>(
    `teams/members/${id}/role/`,
    input,
  );
  return data.data;
}

export async function changeTeamMemberStatus(id: string, action: "suspend" | "activate" | "remove") {
  const { data } = await apiClient.post<ApiSuccessEnvelope<TeamMemberDetail>>(
    `teams/members/${id}/status/`,
    { action },
  );
  return data.data;
}

export async function listTeamInvites() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TeamInvite[]>>("teams/invites/");
  return data.data;
}

export async function createTeamInvite(input: TeamInviteCreateInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<TeamInvite>>("teams/invites/", input);
  return data.data;
}

export async function revokeTeamInvite(id: string) {
  const { data } = await apiClient.delete<ApiSuccessEnvelope<null>>(`teams/invites/${id}/`);
  return data;
}

export async function acceptTeamInvite(token: string) {
  const { data } = await apiClient.post<
    ApiSuccessEnvelope<{ merchant_id: string; business_name: string; role: string }>
  >("teams/invites/accept/", { token });
  return data.data;
}

export interface TeamInviteLookup {
  email: string;
  business_name: string;
  role: string;
}

// Public — no auth required, used to show the invite landing before login/register.
export async function lookupTeamInvite(token: string) {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TeamInviteLookup>>(
    "teams/invites/lookup/",
    { params: { token } },
  );
  return data.data;
}
