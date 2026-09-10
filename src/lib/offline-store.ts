// Offline storage for the POS checkout screen — a cached product catalog
// (for barcode/search lookups with no connection) and a queue of sales
// completed offline, awaiting sync. localStorage is enough for this scale
// (a catalog snapshot + a handful of queued sales) — no IndexedDB schema/
// versioning ceremony, no new dependency.

import type { PendingSale, ProductListEntry } from "@/types/pos";

const PRODUCTS_KEY = "pos:offline:products";
const PENDING_SALES_KEY = "pos:offline:pending-sales";
const CHANGE_EVENT = "pos-offline-change";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private-mode quota errors etc. — offline support degrades to "no
    // cache" rather than crashing the checkout screen.
  }
}

function notifyChange(): void {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function subscribeToOfflineChanges(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

// ── Product catalog cache ───────────────────────────────────────────────

export function cacheProducts(products: ProductListEntry[]): void {
  writeJson(PRODUCTS_KEY, products);
}

export function getCachedProducts(): ProductListEntry[] {
  return readJson<ProductListEntry[]>(PRODUCTS_KEY, []);
}

export function findCachedProductByBarcode(barcode: string): ProductListEntry | null {
  return getCachedProducts().find((p) => p.barcode === barcode) ?? null;
}

export function findCachedProductById(id: string): ProductListEntry | null {
  return getCachedProducts().find((p) => p.id === id) ?? null;
}

export function searchCachedProducts(query: string, limit = 20): ProductListEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return getCachedProducts()
    .filter((p) => p.name.toLowerCase().includes(needle))
    .slice(0, limit);
}

// ── Pending sales queue ──────────────────────────────────────────────────

export function getPendingSales(): PendingSale[] {
  return readJson<PendingSale[]>(PENDING_SALES_KEY, []);
}

export function enqueuePendingSale(sale: PendingSale): void {
  const queue = getPendingSales();
  queue.push(sale);
  writeJson(PENDING_SALES_KEY, queue);
  notifyChange();
}

export function removePendingSale(id: string): void {
  const queue = getPendingSales().filter((s) => s.id !== id);
  writeJson(PENDING_SALES_KEY, queue);
  notifyChange();
}

export function updatePendingSale(id: string, updates: Partial<PendingSale>): void {
  const queue = getPendingSales().map((s) => (s.id === id ? { ...s, ...updates } : s));
  writeJson(PENDING_SALES_KEY, queue);
  notifyChange();
}
