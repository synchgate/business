import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useSettlementAccount } from "@/hooks/use-settlement-account";

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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

/** Gates the main app behind a configured settlement account (see onboarding). */
export function RequireOnboarded() {
  const { isConfigured, isLoading } = useSettlementAccount();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  if (!isConfigured) {
    return <Navigate to="/onboarding/settlement" replace />;
  }

  return <Outlet />;
}

// Guest pages (login, register) redirect to dashboard if already signed in.
// The landing page (/) is always public — don't use RequireGuest there.
export function RequireGuest() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
