import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-[var(--radius-chip)] px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]",
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)] md:flex">
      <div className="flex h-14 items-center px-5">
        <Logo />
      </div>
      <SidebarNav />
      <div className="p-4 text-xs text-[var(--color-muted)]">
        Synchgate Invoicing — invoice.synchgate.com
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[var(--color-surface)] py-4">
        <div className="flex items-center justify-between px-5 pb-4">
          <Logo />
          <button onClick={onClose} className="text-[var(--color-muted)]" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  );
}
