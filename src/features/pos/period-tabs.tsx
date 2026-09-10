import { cn } from "@/lib/utils";
import type { SalePeriod } from "@/types/pos";

export const PERIODS: { value: SalePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

export function PeriodTabs({
  period,
  onChange,
}: {
  period: SalePeriod;
  onChange: (period: SalePeriod) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center rounded-[var(--radius-chip)] px-3 text-sm font-medium transition-colors",
              period === p.value
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-body)] hover:text-[var(--color-ink)]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
