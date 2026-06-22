import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-canvas)] px-4 text-center">
      <Logo />
      <div>
        <p className="font-display text-2xl font-semibold text-[var(--color-ink)]">Page not found</p>
        <p className="mt-1 text-sm text-[var(--color-body)]">That page doesn't exist or may have moved.</p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
