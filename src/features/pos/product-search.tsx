import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductList } from "@/hooks/use-pos";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { searchCachedProducts } from "@/lib/offline-store";
import { formatMoney } from "@/lib/format";
import type { ProductListEntry } from "@/types/pos";

/**
 * Fallback for the checkout screen when there's no barcode scanner (camera
 * or handheld) available — search the catalog by name and pick a result.
 * Falls back to the locally cached catalog when offline (see
 * checkout-page.tsx's catalog prefetch) instead of hitting the server.
 */
export function ProductSearch({ onSelect }: { onSelect: (product: ProductListEntry) => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const online = useOnlineStatus();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: onlineResults, isFetching } = useProductList(
    debouncedQuery ? { search: debouncedQuery, is_active: true } : {},
    { enabled: online && !!debouncedQuery },
  );
  const results = online ? onlineResults : searchCachedProducts(debouncedQuery);
  const showResults = open && debouncedQuery.length > 0;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function clear() {
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  }

  function handleSelect(product: ProductListEntry) {
    onSelect(product);
    clear();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
      <Input
        placeholder="Search products by name"
        className="pl-9 pr-8"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}

      {showResults && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg">
          {isFetching ? (
            <p className="px-3 py-3 text-sm text-[var(--color-muted)]">Searching…</p>
          ) : !results || results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--color-muted)]">No products match "{debouncedQuery}".</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-muted)]"
                  >
                    <span className="min-w-0 truncate text-[var(--color-ink)]">{p.name}</span>
                    <span className="shrink-0 font-ledger text-[var(--color-body)]">{formatMoney(p.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
