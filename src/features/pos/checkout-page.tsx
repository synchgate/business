import { useEffect, useState } from "react";
import { Download, Minus, Plus, Printer, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/state";
import { BarcodeScanner } from "@/components/pos/barcode-scanner";
import { ProductSearch } from "@/features/pos/product-search";
import { QuickAddProductDialog } from "@/features/pos/quick-add-dialog";
import { CustomItemDialog } from "@/features/pos/custom-item-dialog";
import { PosTabs } from "@/features/pos/pos-tabs";
import { PosSyncStatus } from "@/features/pos/pos-sync-status";
import { useCreateSale, useProductList, useTodaySalesSummary } from "@/hooks/use-pos";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { findProductByBarcode } from "@/api/endpoints/pos";
import { cacheProducts, enqueuePendingSale, findCachedProductByBarcode, findCachedProductById } from "@/lib/offline-store";
import { buildPendingSale, isNetworkError } from "@/lib/pos-sync";
import { downloadSaleReceiptPdf, printSaleReceipt } from "@/lib/sale-receipt";
import { formatMoney } from "@/lib/format";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";
import type { PaymentMethod, PendingSale, ProductDetail, ProductListEntry, SaleDetail } from "@/types/pos";

interface CartLine {
  key: string;
  product_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
}

export function CheckoutPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [receipt, setReceipt] = useState<SaleDetail | PendingSale | null>(null);

  const createSale = useCreateSale();
  const { data: todaySummary } = useTodaySalesSummary();
  const online = useOnlineStatus();

  // Full active-catalog snapshot for offline barcode/search lookups (see
  // offline-store.ts) — refreshed silently whenever this succeeds online.
  const { data: catalogSnapshot } = useProductList({ is_active: true });
  useEffect(() => {
    if (catalogSnapshot) cacheProducts(catalogSnapshot);
  }, [catalogSnapshot]);

  const total = cart.reduce((sum, line) => sum + line.unit_price * line.quantity, 0);

  function addToCart(line: Omit<CartLine, "key">) {
    setCart((prev) => {
      if (line.product_id) {
        const existingIndex = prev.findIndex((l) => l.product_id === line.product_id);
        if (existingIndex !== -1) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + line.quantity };
          return next;
        }
      }
      return [...prev, { ...line, key: crypto.randomUUID() }];
    });
  }

  function addProductToCart(product: ProductListEntry | ProductDetail) {
    const alreadyInCart = cart.find((l) => l.product_id === product.id)?.quantity ?? 0;
    if (alreadyInCart + 1 > product.stock_quantity) {
      toast.error(`Only ${Math.max(product.stock_quantity, 0)} "${product.name}" left in stock.`);
      return;
    }
    addToCart({ product_id: product.id, item_name: product.name, unit_price: Number(product.price), quantity: 1 });
  }

  async function handleScan(barcode: string) {
    setLookingUp(true);
    try {
      const product = online ? await findProductByBarcode(barcode) : findCachedProductByBarcode(barcode);
      if (product) {
        addProductToCart(product);
      } else if (online) {
        setPendingBarcode(barcode);
      } else {
        toast.error("Not found in the cached catalog. Add it as a custom item instead.");
      }
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = findCachedProductByBarcode(barcode);
        if (cached) {
          addProductToCart(cached);
        } else {
          toast.error("Not found in the cached catalog. Add it as a custom item instead.");
        }
      } else {
        toast.error("Couldn't look up that barcode. Check your connection and try again.");
      }
    } finally {
      setLookingUp(false);
    }
  }

  function handleProductQuickAdded(product: ProductDetail) {
    addProductToCart(product);
    setPendingBarcode(null);
  }

  function updateQuantity(key: string, delta: number) {
    if (delta > 0) {
      const line = cart.find((l) => l.key === key);
      const product = line?.product_id ? findCachedProductById(line.product_id) : null;
      if (line && product && line.quantity + delta > product.stock_quantity) {
        toast.error(`Only ${Math.max(product.stock_quantity, 0)} "${product.name}" left in stock.`);
        return;
      }
    }
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l)).filter((l) => l.quantity > 0),
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    try {
      const sale = await createSale.mutateAsync({
        id: crypto.randomUUID(),
        payment_method: paymentMethod,
        items: cart.map((l) => ({
          product_id: l.product_id ?? undefined,
          item_name: l.item_name,
          unit_price: l.unit_price,
          quantity: l.quantity,
        })),
      });
      setReceipt(sale);
      setCart([]);
    } catch (err) {
      if (isNetworkError(err) || !online) {
        const pendingSale = buildPendingSale(cart, paymentMethod);
        enqueuePendingSale(pendingSale);
        setReceipt(pendingSale);
        setCart([]);
        return;
      }
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't complete the sale."),
      );
    }
  }

  function startNewSale() {
    setReceipt(null);
    setPaymentMethod("cash");
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <PosTabs />
        <PosSyncStatus />
        <Card>
          <CardHeader>
            <CardTitle>Sale complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{receipt.sale_number}</p>
              <p className="mt-1 font-ledger text-3xl font-semibold text-[var(--color-ink)]">
                {formatMoney(receipt.total_amount)}
              </p>
              <p className="text-sm capitalize text-[var(--color-body)]">{receipt.payment_method}</p>
              {"sync_status" in receipt && (
                <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                  Pending sync — will upload automatically when you're back online.
                </p>
              )}
            </div>
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-[var(--color-ink)]">
                    {item.item_name} × {item.quantity}
                  </span>
                  <span className="font-ledger text-[var(--color-body)]">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => printSaleReceipt(receipt)}>
                <Printer className="size-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => downloadSaleReceiptPdf(receipt)}
              >
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
            <Button className="w-full" onClick={startNewSale}>
              New sale
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PosTabs />
      <PosSyncStatus />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Checkout</h2>
          <p className="text-sm text-[var(--color-body)]">Scan or add items to start a sale.</p>
        </div>
        <div className="rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm">
          <span className="text-[var(--color-muted)]">Today: </span>
          <span className="font-medium text-[var(--color-ink)]">
            {todaySummary
              ? `${formatMoney(todaySummary.total)} · ${todaySummary.count} sale${todaySummary.count === 1 ? "" : "s"}`
              : "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProductSearch onSelect={addProductToCart} />
        <BarcodeScanner triggerLabel={lookingUp ? "Looking up…" : "Scan item"} onScan={handleScan} />
        <Button type="button" variant="secondary" onClick={() => setShowCustomItem(true)}>
          <Plus className="size-4" />
          Custom item
        </Button>
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {cart.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Cart is empty"
              description="Scan a barcode or add a custom item to start this sale."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((line) => (
                  <TableRow key={line.key}>
                    <TableCell className="text-[var(--color-ink)]">{line.item_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.key, -1)}
                          className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center font-ledger text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.key, 1)}
                          className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-ledger text-sm text-[var(--color-body)]">
                      {formatMoney(line.unit_price)}
                    </TableCell>
                    <TableCell className="font-ledger text-sm text-[var(--color-ink)]">
                      {formatMoney(line.unit_price * line.quantity)}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-status-overdue)]"
                        aria-label={`Remove ${line.item_name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {cart.length > 0 && (
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-body)]">Total</span>
              <span className="font-ledger text-2xl font-semibold text-[var(--color-ink)]">{formatMoney(total)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => setPaymentMethod("cash")}
              >
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "other" ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => setPaymentMethod("other")}
              >
                Other
              </Button>
            </div>
            <Button className="w-full" size="lg" onClick={handleCompleteSale} disabled={createSale.isPending}>
              {createSale.isPending ? "Completing…" : `Complete sale — ${formatMoney(total)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      <QuickAddProductDialog
        barcode={pendingBarcode}
        onOpenChange={(open) => !open && setPendingBarcode(null)}
        onCreated={handleProductQuickAdded}
      />
      <CustomItemDialog
        open={showCustomItem}
        onOpenChange={setShowCustomItem}
        onAdd={(item) => addToCart({ product_id: null, ...item })}
      />
    </div>
  );
}
