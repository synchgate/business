import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon: Icon, hint, isLoading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--color-body)]">{label}</p>
        <Icon className="size-4 text-[var(--color-muted)]" />
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className={cn("font-ledger mt-1 text-2xl font-medium text-[var(--color-ink)]")}>{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </Card>
  );
}
