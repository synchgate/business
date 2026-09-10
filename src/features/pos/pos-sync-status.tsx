import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { usePendingSales } from "@/hooks/use-pending-sales";
import { syncPendingSales } from "@/lib/pos-sync";

export function PosSyncStatus() {
  const online = useOnlineStatus();
  const allSales = usePendingSales();
  const pendingSales = allSales.filter((s) => s.sync_status === "pending");
  const failedSales = allSales.filter((s) => s.sync_status === "failed");

  if (online && pendingSales.length === 0 && failedSales.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!online && (
        <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-body)]">
          <CloudOff className="size-3.5" />
          You're offline — sales will save locally and sync automatically.
        </div>
      )}

      {online && pendingSales.length > 0 && (
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] bg-[var(--color-primary-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)]">
          <span>
            {pendingSales.length} sale{pendingSales.length === 1 ? "" : "s"} waiting to sync
          </span>
          <button
            type="button"
            onClick={() => syncPendingSales()}
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
          >
            <RefreshCw className="size-3" />
            Sync now
          </button>
        </div>
      )}

      {failedSales.length > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-[color-mix(in_srgb,var(--color-status-overdue)_14%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--color-status-overdue)]">
          <AlertTriangle className="size-3.5" />
          {failedSales.length} sale{failedSales.length === 1 ? "" : "s"} couldn't sync — see Sales History
        </div>
      )}
    </div>
  );
}
