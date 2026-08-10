import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-team";

/**
 * Hides children unless the caller's active membership has `code` in its
 * resolved permission set (see teams/models/roles.py Permission choices).
 * This is a UI convenience only — the backend is the actual gate, this
 * just avoids showing actions a role can't use.
 */
export function RequirePermission({ code, children }: { code: string; children: ReactNode }) {
  const allowed = usePermission(code);
  if (!allowed) return null;
  return <>{children}</>;
}
