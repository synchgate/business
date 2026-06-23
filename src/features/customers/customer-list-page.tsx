import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Plus, Search, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCustomerList } from "@/hooks/use-customers";
import { formatDate } from "@/lib/format";
import { CustomerForm } from "@/features/customers/customer-form";

export function CustomerListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useCustomerList({
    search: search || undefined,
    page,
  });

  const customers = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Customers</h2>
          <p className="text-sm text-[var(--color-body)]">
            Manage your customer directory. Select a customer when creating invoices.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          New customer
        </Button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <Input
          placeholder="Search by name or email"
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="space-y-2 px-5 py-5">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <ErrorState description="Couldn't load your customers." onRetry={() => refetch()} />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? "No matching customers" : "No customers yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Add your first customer to start creating invoices faster."
              }
              action={!search ? { label: "Add customer", onClick: () => setShowCreate(true) } : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">
                            {c.customer_type === "business" && c.business_name ? c.business_name : c.name}
                          </p>
                          <p className="text-xs text-[var(--color-muted)]">{c.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="capitalize">{c.customer_type}</Badge>
                      </TableCell>
                      <TableCell className="text-[var(--color-body)]">{c.phone ?? "—"}</TableCell>
                      <TableCell>
                        {c.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-status-paid)]">
                            <UserCheck className="size-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)]">
                            <UserX className="size-3.5" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-[var(--color-body)]">{formatDate(c.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/invoices/new?customer=${c.id}`}>Invoice</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-[var(--color-line)] px-5 py-3">
                <p className="text-xs text-[var(--color-muted)]">{data?.count ?? 0} customers total</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={!data?.previous} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="secondary" size="sm" disabled={!data?.next} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New customer</DialogTitle>
            <DialogDescription>Add a customer to your directory. You can then select them when creating invoices.</DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSuccess={() => {
              setShowCreate(false);
              refetch();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
