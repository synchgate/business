import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-team";

const TABS = [
  { to: "/pos/dashboard", label: "Dashboard", permission: "pos.view" },
  { to: "/pos/checkout", label: "Checkout", permission: "pos.sell" },
  { to: "/pos/products", label: "Products", permission: "pos.view" },
  { to: "/pos/sales", label: "Sales", permission: "pos.view" },
];

export function PosTabs() {
  const canSell = usePermission("pos.sell");
  const canView = usePermission("pos.view");
  const permissions: Record<string, boolean> = { "pos.sell": canSell, "pos.view": canView };
  const visibleTabs = TABS.filter((tab) => permissions[tab.permission]);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-1">
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "inline-flex h-7 shrink-0 items-center rounded-[var(--radius-chip)] px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                  : "text-[var(--color-body)] hover:text-[var(--color-ink)]",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
