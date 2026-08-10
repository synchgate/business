// Mirrors teams/models + teams/serializers exactly.

export type TeamRole = "owner" | "admin" | "manager" | "accountant" | "staff";

export const ROLE_LABEL: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  accountant: "Accountant",
  staff: "Staff",
};

export const ASSIGNABLE_ROLES: TeamRole[] = ["admin", "manager", "accountant", "staff"];

export type TeamMemberStatus = "invited" | "active" | "suspended" | "removed";

export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: TeamRole;
  title: string;
  status: TeamMemberStatus;
  invited_at: string;
  joined_at: string | null;
}

export interface TeamMemberDetail extends TeamMember {
  permissions: string[];
  permission_overrides: { grant?: string[]; revoke?: string[] };
}

export interface TeamMemberUpdateInput {
  role?: TeamRole;
  title?: string;
}

export type TeamInviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  status: TeamInviteStatus;
  created_at: string;
  expires_at: string;
}

export interface TeamInviteCreateInput {
  email: string;
  role: TeamRole;
}
