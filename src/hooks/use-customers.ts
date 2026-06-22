import { useQuery } from "@tanstack/react-query";
import { listInvoices } from "@/api/endpoints/invoices";
import type { InvoiceListEntry } from "@/types/invoice";

export interface CustomerSummary {
  email: string;
  name: string;
  phone: string | null;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  lastInvoiceDate: string;
  currency: string;
}

// There's no Customer model on the backend — customer_name/email/phone live
// directly on each Invoice row (implementation plan, gap #2). This builds a
// directory by paginating through every invoice and grouping client-side,
// capped at MAX_PAGES so a merchant with a very large invoice history
// doesn't trigger unbounded requests; the dashboard's own per-status filters
// remain the precise source of truth either way.
const MAX_PAGES = 10;

async function fetchAllInvoices(): Promise<InvoiceListEntry[]> {
  const all: InvoiceListEntry[] = [];
  let page = 1;
  while (page <= MAX_PAGES) {
    const { results, next } = await listInvoices({ page });
    all.push(...results);
    if (!next) break;
    page += 1;
  }
  return all;
}

function buildDirectory(invoices: InvoiceListEntry[]): CustomerSummary[] {
  const byEmail = new Map<string, CustomerSummary>();
  for (const invoice of invoices) {
    const existing = byEmail.get(invoice.customer_email);
    const billed = Number(invoice.total_amount) || 0;
    const paid = Number(invoice.amount_paid) || 0;
    if (existing) {
      existing.invoiceCount += 1;
      existing.totalBilled += billed;
      existing.totalPaid += paid;
      if (new Date(invoice.created_at) > new Date(existing.lastInvoiceDate)) {
        existing.lastInvoiceDate = invoice.created_at;
        existing.name = invoice.customer_name;
      }
    } else {
      byEmail.set(invoice.customer_email, {
        email: invoice.customer_email,
        name: invoice.customer_name,
        phone: null,
        invoiceCount: 1,
        totalBilled: billed,
        totalPaid: paid,
        lastInvoiceDate: invoice.created_at,
        currency: invoice.currency,
      });
    }
  }
  return Array.from(byEmail.values()).sort(
    (a, b) => new Date(b.lastInvoiceDate).getTime() - new Date(a.lastInvoiceDate).getTime(),
  );
}

export function useCustomerDirectory() {
  const query = useQuery({
    queryKey: ["invoices", "customerDirectory"],
    queryFn: fetchAllInvoices,
    staleTime: 60_000,
  });

  return {
    customers: query.data ? buildDirectory(query.data) : [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
