import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/payroll/runs", label: "Payroll runs" },
  { to: "/payroll/employees", label: "Employees" },
  { to: "/payroll/advances", label: "Salary advances" },
];

export function PayrollTabs() {
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "inline-flex h-7 items-center rounded-[var(--radius-chip)] px-3 text-sm font-medium transition-colors",
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
  );
}
