import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="mb-6 space-y-1">
            <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">{title}</h1>
            {description && <p className="text-sm text-[var(--color-body)]">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
