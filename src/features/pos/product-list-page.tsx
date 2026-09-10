import { useState } from "react";
import { FolderCog, Package, Plus, Search, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequirePermission } from "@/components/team/require-permission";
import { usePermission } from "@/hooks/use-team";
import { useProductList } from "@/hooks/use-pos";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductForm } from "@/features/pos/product-form";
import { ProductImportDialog } from "@/features/pos/product-import-dialog";
import { CategoryManagerDialog } from "@/features/pos/category-manager-dialog";
import { PosTabs } from "@/features/pos/pos-tabs";
import type { ProductListEntry } from "@/types/pos";

export function ProductListPage() {
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductListEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const canManage = usePermission("pos.manage");

  const { data: products, isLoading, isError, refetch } = useProductList({ search: search || undefined });

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (product: ProductListEntry) => {
    if (!canManage) return;
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <PosTabs />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Products</h2>
          <p className="text-sm text-[var(--color-body)]">Manage your product catalog for point of sale.</p>
        </div>
        <RequirePermission code="pos.manage">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowCategories(true)}>
              <FolderCog className="size-4" />
              Categories
            </Button>
            <Button variant="secondary" onClick={() => setShowImport(true)}>
              <Upload className="size-4" />
              Import
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add product
            </Button>
          </div>
        </RequirePermission>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <Input placeholder="Search products" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load your products." onRetry={() => refetch()} />
          ) : !products || products.length === 0 ? (
            <EmptyState
              icon={Package}
              title={search ? "No matching products" : "No products yet"}
              description={search ? "Try a different search term." : "Add your first product to start selling."}
              action={!search ? { label: "Add product", onClick: openCreate } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className={cn(canManage && "cursor-pointer")}
                    onClick={() => openEdit(p)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{p.name}</p>
                        {p.barcode && <p className="text-xs text-[var(--color-muted)]">{p.barcode}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">
                      {p.category ? <Badge>{p.category.name}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="text-[var(--color-body)]">{formatMoney(p.price)}</TableCell>
                    <TableCell className={p.stock_quantity < 0 ? "text-[var(--color-status-overdue)]" : "text-[var(--color-body)]"}>
                      {p.stock_quantity}
                    </TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <span className="text-xs font-medium text-[var(--color-status-paid)]">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--color-muted)]">Inactive</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update this product's details." : "Add an item to your catalog. You can edit it anytime."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            existing={editingProduct ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <ProductImportDialog open={showImport} onOpenChange={setShowImport} />
      <CategoryManagerDialog open={showCategories} onOpenChange={setShowCategories} />
    </div>
  );
}
