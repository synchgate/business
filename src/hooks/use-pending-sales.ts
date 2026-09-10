import { useEffect, useState } from "react";
import { getPendingSales, subscribeToOfflineChanges } from "@/lib/offline-store";
import type { PendingSale } from "@/types/pos";

export function usePendingSales(): PendingSale[] {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>(() => getPendingSales());

  useEffect(() => {
    return subscribeToOfflineChanges(() => setPendingSales(getPendingSales()));
  }, []);

  return pendingSales;
}
