import { useState } from "react";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useImportProducts } from "@/hooks/use-pos";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import type { ProductImportResult } from "@/types/pos";

export function ProductImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const importProducts = useImportProducts();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
  }

  const handleUpload = async () => {
    if (!file) return;
    try {
      const data = await importProducts.mutateAsync(file);
      setResult(data);
      if (data.skipped.length === 0) toast.success(`Imported ${data.created} products.`);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't import the file."),
      );
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setFile(null);
      setResult(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import products</DialogTitle>
          <DialogDescription>
            Upload a .csv or .xlsx file with columns: name, price, barcode, category, stock_quantity (only name and
            price are required).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="product_import_file">
              <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
                <Upload className="size-4" />
                {file ? "Change file" : "Choose file"}
              </span>
              <input
                id="product_import_file"
                type="file"
                accept=".csv,.xlsx"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            {file && <p className="text-xs text-[var(--color-muted)]">{file.name}</p>}
          </div>

          {result && (
            <div className="space-y-2 rounded-[var(--radius-chip)] border border-[var(--color-line)] p-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-status-paid)]">
                <CheckCircle2 className="size-4" />
                {result.created} product{result.created === 1 ? "" : "s"} imported
              </div>
              {result.skipped.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[var(--color-status-overdue)]">
                    <AlertTriangle className="size-4" />
                    {result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped
                  </div>
                  <ul className="max-h-32 space-y-0.5 overflow-y-auto pl-6 text-xs text-[var(--color-muted)]">
                    {result.skipped.map((s) => (
                      <li key={s.row} className="list-disc">
                        Row {s.row}: {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => handleClose(false)}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button type="button" onClick={handleUpload} disabled={!file || importProducts.isPending}>
                {importProducts.isPending ? "Importing…" : "Import"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
