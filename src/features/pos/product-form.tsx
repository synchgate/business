import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarcodeScanner } from "@/components/pos/barcode-scanner";
import { useCategoryList, useCreateProduct, useUpdateProduct } from "@/hooks/use-pos";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import type { ProductListEntry } from "@/types/pos";

// Radix Select forbids an empty-string item value, so "no category" needs a
// sentinel that's translated to/from null at the form's edges.
const NO_CATEGORY = "__none__";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category_id: z.string().optional(),
  price: z.coerce.number().positive("Must be greater than zero"),
  barcode: z.string().optional(),
  stock_quantity: z.coerce.number().int("Must be a whole number").min(0, "Can't be negative"),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function ProductForm({
  existing,
  onSuccess,
  onCancel,
}: {
  existing?: ProductListEntry;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { data: categories } = useCategoryList();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEdit = !!existing;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          name: existing.name,
          category_id: existing.category?.id ?? NO_CATEGORY,
          price: Number(existing.price),
          barcode: existing.barcode ?? "",
          stock_quantity: existing.stock_quantity,
        }
      : { stock_quantity: 0, category_id: NO_CATEGORY },
  });

  const categoryId = watch("category_id");

  const onSubmit = async (values: FormValues) => {
    const input = {
      ...values,
      category_id: values.category_id === NO_CATEGORY ? null : values.category_id,
    };
    try {
      if (isEdit && existing) {
        await updateProduct.mutateAsync({ id: existing.id, input });
        toast.success("Product updated.");
      } else {
        await createProduct.mutateAsync(input);
        toast.success("Product added.");
      }
      onSuccess();
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          `Couldn't ${isEdit ? "update" : "add"} the product.`,
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="p_name">Product name</Label>
          <Input id="p_name" {...register("name")} />
          {errors.name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p_price">Price (₦)</Label>
          <Input id="p_price" type="number" step="0.01" {...register("price")} />
          {errors.price && <p className="text-xs text-[var(--color-status-overdue)]">{errors.price.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p_stock">Stock quantity</Label>
          <Input id="p_stock" type="number" step="1" {...register("stock_quantity")} />
          {errors.stock_quantity && (
            <p className="text-xs text-[var(--color-status-overdue)]">{errors.stock_quantity.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={(v) => setValue("category_id", v)}>
            <SelectTrigger>
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY}>No category</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(!categories || categories.length === 0) && (
            <p className="text-xs text-[var(--color-muted)]">
              No categories yet — add one from "Manage categories" on the products page.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p_barcode">Barcode</Label>
          <div className="flex gap-2">
            <Input id="p_barcode" placeholder="Optional" {...register("barcode")} />
            <BarcodeScanner triggerLabel="Scan" onScan={(code) => setValue("barcode", code)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
