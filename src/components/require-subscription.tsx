import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSubscription } from "@/hooks/use-billing";

function UpgradePrompt() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
        <Lock className="size-5 text-[var(--color-muted)]" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-[var(--color-ink)]">
          This feature is part of the Pro plan
        </p>
        <p className="max-w-sm text-sm text-[var(--color-body)]">
          Upgrade for ₦1,500/month to unlock this and other Pro features.
        </p>
      </div>
      <Button size="sm" className="mt-2" onClick={() => navigate("/settings?tab=plan")}>
        Upgrade to Pro
      </Button>
    </div>
  );
}

export function RequireSubscription({ children }: { children: ReactNode }) {
  const { data: subscription, isLoading } = useCurrentSubscription();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasPaidPlan = !!subscription?.plan && Number(subscription.plan.price) > 0;
  if (!hasPaidPlan) return <UpgradePrompt />;

  return <>{children}</>;
}
