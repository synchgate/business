import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Building2,
  X,
  Wallet,
  Send,
  ClipboardList,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard",       label: "Dashboard",      icon: LayoutDashboard },
  { to: "/invoices",        label: "Invoices",        icon: FileText },
  { to: "/quotes",          label: "Quotations",      icon: ClipboardList },
  { to: "/virtual-account", label: "Virtual Account", icon: Building2 },
  { to: "/customers",       label: "Customers",       icon: Users },
  { to: "/settings",        label: "Settings",        icon: Settings },
];

const COMING_SOON = [
  { label: "Payroll",   icon: Wallet },
  { label: "Transfers", icon: Send },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col">
      <div className="px-3 py-2">
        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Platform
        </p>
        <div className="flex flex-col gap-0.5">
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
        </div>
      </div>

      <div className="mt-4 px-3 py-2">
        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Coming soon
        </p>
        <div className="flex flex-col gap-0.5">
          {COMING_SOON.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[var(--radius-chip)] px-3 py-2 text-sm font-medium text-[var(--color-muted)] opacity-60"
            >
              <span className="flex items-center gap-3">
                <item.icon className="size-4" />
                {item.label}
              </span>
              <span className="rounded-full bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px]">
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)] md:flex">
      <div className="flex h-14 items-center border-b border-[var(--color-line)] px-5">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-3">
        <SidebarNav />
      </div>
      <div className="border-t border-[var(--color-line)] p-4">
        <p className="text-[10px] text-[var(--color-muted)]">Banking Business Platform</p>
        <p className="text-[10px] text-[var(--color-muted)]">ebs.entacrest.com</p>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex h-14 items-center justify-between border-b border-[var(--color-line)] px-5">
          <Logo />
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto py-3">
          <SidebarNav onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
