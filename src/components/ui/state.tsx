import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
        <Icon className="size-5 text-[var(--color-muted)]" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="max-w-sm text-sm text-[var(--color-body)]">{description}</p>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Couldn't load this", description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-status-overdue)_14%,transparent)]">
        <AlertTriangle className="size-5 text-[var(--color-status-overdue)]" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="max-w-sm text-sm text-[var(--color-body)]">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
