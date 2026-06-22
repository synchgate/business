import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/format";
import type { InvoiceStatus } from "@/types/invoice";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-body)]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The one place status color carries meaning throughout the app — a small
 * dot plus label, colored from the shared --color-status-* tokens. Used
 * alongside the left-rail accent on table rows/cards, never as decoration
 * elsewhere.
 */
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const color = `var(--color-status-${status})`;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function statusRailStyle(status: InvoiceStatus) {
  return { borderLeftColor: `var(--color-status-${status})` };
}
