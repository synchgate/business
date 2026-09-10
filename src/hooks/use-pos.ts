import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createProduct,
  createSale,
  deactivateProduct,
  deleteCategory,
  getProduct,
  getSale,
  getTodaySalesSummary,
  importProducts,
  listCategories,
  listProducts,
  listSales,
  updateCategory,
  updateProduct,
  type ProductListFilters,
} from "@/api/endpoints/pos";
import type { CategoryCreateInput, ProductCreateInput, SaleCreateInput, SaleListFilters, SalePeriod } from "@/types/pos";

function useInvalidate(key: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [key] });
}

// ── Categories ───────────────────────────────────────────────────────

export function useCategoryList() {
  return useQuery({ queryKey: ["pos", "categories"], queryFn: listCategories });
}

export function useCreateCategory() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (input: CategoryCreateInput) => createCategory(input), onSuccess: invalidate });
}

export function useUpdateCategory() {
  const invalidate = useInvalidate("pos");
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryCreateInput }) => updateCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (id: string) => deleteCategory(id), onSuccess: invalidate });
}

// ── Products ─────────────────────────────────────────────────────────

export function useProductList(filters: ProductListFilters = {}) {
  return useQuery({ queryKey: ["pos", "products", filters], queryFn: () => listProducts(filters) });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["pos", "products", "detail", id],
    queryFn: () => getProduct(id as string),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (input: ProductCreateInput) => createProduct(input), onSuccess: invalidate });
}

export function useUpdateProduct() {
  const invalidate = useInvalidate("pos");
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductCreateInput> }) => updateProduct(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateProduct() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (id: string) => deactivateProduct(id), onSuccess: invalidate });
}

export function useImportProducts() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (file: File) => importProducts(file), onSuccess: invalidate });
}

// ── Sales ────────────────────────────────────────────────────────────

export function useSaleList(filters: SaleListFilters = {}) {
  return useQuery({ queryKey: ["pos", "sales", "list", filters], queryFn: () => listSales(filters) });
}

export function useSaleDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["pos", "sales", "detail", id],
    queryFn: () => getSale(id as string),
    enabled: !!id,
  });
}

export function useTodaySalesSummary(period: SalePeriod = "today") {
  return useQuery({
    queryKey: ["pos", "sales", "summary", period],
    queryFn: () => getTodaySalesSummary(period),
    staleTime: 15_000,
  });
}

export function useCreateSale() {
  const invalidate = useInvalidate("pos");
  return useMutation({ mutationFn: (input: SaleCreateInput) => createSale(input), onSuccess: invalidate });
}
