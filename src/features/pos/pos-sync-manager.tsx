import { useEffect } from "react";
import { syncPendingSales } from "@/lib/pos-sync";

/**
 * No UI — mounted once in AppShell so a sale queued offline still syncs even
 * if the cashier has since navigated away from the checkout page. Tries once
 * on mount (covers a queue left over from a previous session) and again on
 * every `online` event.
 */
export function PosSyncManager() {
  useEffect(() => {
    syncPendingSales();
    window.addEventListener("online", syncPendingSales);
    return () => window.removeEventListener("online", syncPendingSales);
  }, []);

  return null;
}
