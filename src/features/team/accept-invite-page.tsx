import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { lookupTeamInvite } from "@/api/endpoints/team";
import { useAcceptTeamInvite } from "@/hooks/use-team";
import { readErrorMessage } from "@/api/envelope";
import { useAuth } from "@/context/auth-context";

type State =
  | { status: "loading" }
  | { status: "landing"; email: string; businessName: string; role: string }
  | { status: "success"; businessName: string; role: string }
  | { status: "error"; message: string };

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const acceptInvite = useAcceptTeamInvite();

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setState({ status: "error", message: "This invite link is missing its token." });
      return;
    }

    if (isAuthenticated) {
      acceptInvite.mutateAsync(token)
        .then((result) => {
          setState({ status: "success", businessName: result.business_name, role: result.role });
        })
        .catch((err) => {
          setState({
            status: "error",
            message: readErrorMessage(
              (err as { response?: { data?: unknown } }).response?.data,
              "Couldn't accept this invite. It may have expired or already been used.",
            ),
          });
        });
      return;
    }

    // Not logged in — show who invited them before sending to register/login.
    lookupTeamInvite(token)
      .then((invite) => {
        setState({ status: "landing", email: invite.email, businessName: invite.business_name, role: invite.role });
      })
      .catch((err) => {
        setState({
          status: "error",
          message: readErrorMessage(
            (err as { response?: { data?: unknown } }).response?.data,
            "This invite link is invalid or has expired.",
          ),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated, authLoading]);

  if (state.status === "loading") {
    return (
      <AuthLayout title="Loading invite…">
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--color-body)]">
          <Loader2 className="size-4 animate-spin" />
          One moment…
        </div>
      </AuthLayout>
    );
  }

  if (state.status === "landing") {
    return (
      <AuthLayout title="You're invited">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-sm text-[var(--color-body)]">
            You've been invited to join{" "}
            <span className="font-medium text-[var(--color-ink)]">{state.businessName}</span> as{" "}
            <span className="font-medium text-[var(--color-ink)] capitalize">{state.role}</span>.
          </p>
          <p className="text-xs text-[var(--color-muted)]">Invite sent to {state.email}</p>
          <Button className="mt-2 w-full" onClick={() => navigate(`/register?invite=${token}`)}>
            Create account
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate(`/login?invite=${token}`)}>
            Log in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (state.status === "success") {
    return (
      <AuthLayout title="You're in!">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 className="size-10 text-[var(--color-status-paid)]" />
          <p className="text-sm text-[var(--color-body)]">
            You've joined <span className="font-medium text-[var(--color-ink)]">{state.businessName}</span> as{" "}
            <span className="font-medium text-[var(--color-ink)] capitalize">{state.role}</span>.
          </p>
          <Button className="mt-2 w-full" onClick={() => navigate("/dashboard", { replace: true })}>
            Go to dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Couldn't accept invite">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <XCircle className="size-10 text-[var(--color-status-overdue)]" />
        <p className="text-sm text-[var(--color-body)]">{state.message}</p>
        <Link to="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          Go to dashboard
        </Link>
      </div>
    </AuthLayout>
  );
}
