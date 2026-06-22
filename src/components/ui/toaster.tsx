import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-line)",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}

export { toast } from "sonner";
