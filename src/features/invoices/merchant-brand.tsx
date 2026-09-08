import { Logo } from "@/components/logo";

export function MerchantBrand({ logo, name }: { logo: string | null; name: string }) {
  if (!logo) return <Logo />;
  return (
    <div className="flex items-center gap-2">
      <img
        src={logo}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-[0.4rem] object-cover"
      />
      <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
        {name}
      </span>
    </div>
  );
}
