import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useSettlementAccount } from "@/hooks/use-settlement-account";
import { useActiveMembership } from "@/hooks/use-team";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}

/**
 * Gates the main app behind a configured settlement account — but only for
 * the business owner. Setting up settlement/bank details is the owner's
 * responsibility, not an invited team member's; a staff/admin/manager/etc.
 * skips straight into the app shell regardless of the owner's setup state.
 */
export function RequireOnboarded() {
  const { data: membership, isLoading: membershipLoading } = useActiveMembership();
  const { isConfigured, isLoading: settlementLoading } = useSettlementAccount();

  if (membershipLoading || settlementLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  const isOwner = membership?.role === "owner";
  if (isOwner && !isConfigured) {
    return <Navigate to="/onboarding/settlement" replace />;
  }

  return <Outlet />;
}

// Guest pages (login, register) redirect to dashboard if already signed in.
// The landing page (/) is always public — don't use RequireGuest there.
export function RequireGuest() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  // If the same instant the caller becomes authenticated (e.g. right after
  // submitting the login form) races LoginPage's own post-login navigate,
  // this redirect must agree on the same destination rather than always
  // winning with /dashboard and skipping the pending invite-accept step.
  const inviteToken = searchParams.get("invite");

  if (isAuthenticated) {
    return <Navigate to={inviteToken ? `/team/accept-invite?token=${inviteToken}` : "/dashboard"} replace />;
  }
  return <Outlet />;
}
