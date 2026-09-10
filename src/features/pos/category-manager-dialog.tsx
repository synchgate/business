import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryList, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-pos";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";

export function CategoryManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories, isLoading } = useCategoryList();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createCategory.mutateAsync({ name: trimmed });
      setName("");
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't add the category."),
      );
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    try {
      await updateCategory.mutateAsync({ id, input: { name: trimmed } });
      cancelEditing();
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't rename the category."),
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't delete the category."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage categories</DialogTitle>
          <DialogDescription>Organize your catalog. Products keep their name if a category is removed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button type="button" onClick={handleAdd} disabled={!name.trim() || createCategory.isPending}>
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : !categories || categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-muted)]">No categories yet.</p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-chip)] border border-[var(--color-line)] px-3 py-2 text-sm"
                >
                  {editingId === c.id ? (
                    <>
                      <Input
                        autoFocus
                        className="h-7"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRename(c.id);
                          }
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleRename(c.id)}
                          className="text-[var(--color-status-paid)] hover:opacity-80"
                          aria-label="Save"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="truncate text-[var(--color-ink)]">{c.name}</span>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(c.id, c.name)}
                          className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                          aria-label={`Rename ${c.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="text-[var(--color-muted)] hover:text-[var(--color-status-overdue)]"
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
