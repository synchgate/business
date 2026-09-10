import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProduct } from "@/hooks/use-pos";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import type { ProductDetail } from "@/types/pos";

/**
 * Scanned a barcode with no catalog match — rather than blocking the sale,
 * let the cashier add it to the catalog right here (name + price only) and
 * continue. This creates a real Product (via the same endpoint as the
 * catalog page), not a one-off sale line — see CustomItemDialog for that.
 */
export function QuickAddProductDialog({
  barcode,
  onOpenChange,
  onCreated,
}: {
  barcode: string | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (product: ProductDetail) => void;
}) {
  const createProduct = useCreateProduct();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    setName("");
    setPrice("");
  }, [barcode]);

  const parsedPrice = Number(price);
  const canSubmit = name.trim().length > 0 && parsedPrice > 0;

  const handleAdd = async () => {
    if (!canSubmit || !barcode) return;
    try {
      const product = await createProduct.mutateAsync({ name: name.trim(), price: parsedPrice, barcode });
      onCreated(product);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't add the product."),
      );
    }
  };

  return (
    <Dialog open={!!barcode} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Unknown barcode</DialogTitle>
          <DialogDescription>No product matches "{barcode}". Add it now to continue this sale.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="qa_name">Product name</Label>
            <Input id="qa_name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa_price">Price (₦)</Label>
            <Input id="qa_price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button type="button" onClick={handleAdd} disabled={!canSubmit || createProduct.isPending}>
              {createProduct.isPending ? "Adding…" : "Add & continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
