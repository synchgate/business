import { useState } from "react";
import { Menu, Moon, Sun, LogOut } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/sidebar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ title }: { title: string }) {
  const { user, merchant, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-[var(--radius-chip)] p-1.5 text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="font-display text-base font-semibold text-[var(--color-ink)]">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-[var(--radius-chip)] p-2 text-[var(--color-body)] hover:bg-[var(--color-surface-muted)]"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-[var(--radius-chip)] p-1 hover:bg-[var(--color-surface-muted)]">
                <Avatar>
                  <AvatarFallback>{initials(user?.full_name || merchant?.business_name || "S")}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-48 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-lg"
              >
                <div className="px-2.5 py-2 text-sm">
                  <p className="font-medium text-[var(--color-ink)]">{user?.full_name}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-line)]" />
                <DropdownMenu.Item
                  onSelect={logout}
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-chip)] px-2.5 py-2 text-sm text-[var(--color-status-overdue)] outline-none hover:bg-[var(--color-surface-muted)]"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
