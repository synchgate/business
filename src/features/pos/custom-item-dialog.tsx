import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A one-off sale line with no barcode and no catalog entry — never becomes
 * a Product, just a SaleItem with product_id=null. See QuickAddProductDialog
 * for the "scanned an unknown barcode" case, which does create a Product.
 */
export function CustomItemDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: { item_name: string; unit_price: number; quantity: number }) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);
  const canSubmit = name.trim().length > 0 && parsedPrice > 0 && parsedQuantity > 0;

  const reset = () => {
    setName("");
    setPrice("");
    setQuantity("1");
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd({ item_name: name.trim(), unit_price: parsedPrice, quantity: parsedQuantity });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Custom item</DialogTitle>
          <DialogDescription>For a one-off sale that isn't in your catalog.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ci_name">Item name</Label>
            <Input id="ci_name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ci_price">Price (₦)</Label>
              <Input id="ci_price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ci_qty">Quantity</Label>
              <Input id="ci_qty" type="number" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd} disabled={!canSubmit}>
              Add to cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
