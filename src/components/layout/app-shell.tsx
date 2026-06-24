import { Outlet, useMatches } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell() {
  const matches = useMatches();
  const current = matches[matches.length - 1] as { handle?: { title?: string } } | undefined;
  const title = current?.handle?.title ?? "";

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
