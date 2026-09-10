import { CloudOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { usePendingSales } from "@/hooks/use-pending-sales";
import { syncPendingSales } from "@/lib/pos-sync";

export function PosSyncStatus() {
  const online = useOnlineStatus();
  const pendingSales = usePendingSales();

  if (online && pendingSales.length === 0) return null;

  if (!online) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-body)]">
        <CloudOff className="size-3.5" />
        You're offline — sales will save locally and sync automatically.
      </div>
    );
  }

  return (
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
  );
}
