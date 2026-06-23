import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { InvoiceDetail } from "@/types/invoice";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";

import { formatDate, formatMoney } from "@/lib/format";

export default function PublicInvoicePage() {
  const { invoiceNumber } = useParams();

  const { data, isLoading, isError } = useQuery<InvoiceDetail>({
    queryKey: ["public-invoice", invoiceNumber],
    queryFn: async () => {
      const response = await apiClient.post(
        `invoicing/pay/${invoiceNumber}/`
      );
      return response.data.data;
    },
    enabled: !!invoiceNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-500">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">

        {/* HEADER */}
        <Card>
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <Logo />
              <p className="mt-3 font-medium text-lg">
                {data.invoice_number}
              </p>
            </div>

            <div className="text-right">
              <InvoiceStatusBadge status={data.status} />
              <p className="text-sm text-[var(--color-body)] mt-2">
                Issued {formatDate(data.issue_date)}
              </p>
              <p className="text-sm text-[var(--color-body)]">
                Due {formatDate(data.due_date)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* BILLING */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase text-[var(--color-muted)]">
              Billed to
            </p>
            <p className="mt-1 font-medium">{data.customer_name}</p>
            <p className="text-sm text-[var(--color-body)]">
              {data.customer_email}
            </p>
            {data.customer_phone && (
              <p className="text-sm text-[var(--color-body)]">
                {data.customer_phone}
              </p>
            )}

            <Separator className="my-4" />

            {data.payment_link ? (
              <a
                href={data.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm"
              >
                Pay Invoice
              </a>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                Payment not available
              </p>
            )}
          </CardContent>
        </Card>

        {/* ITEMS */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p>{item.item_name}</p>
                      {item.description && (
                        <p className="text-xs text-[var(--color-muted)]">
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {item.quantity}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.unit_price, data.currency)}
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {formatMoney(item.amount, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* TOTAL */}
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(data.subtotal, data.currency)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatMoney(data.discount, data.currency)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>+{formatMoney(data.tax, data.currency)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatMoney(data.total_amount, data.currency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* NOTES */}
        {(data.notes || data.terms) && (
          <Card>
            <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
              {data.notes && (
                <div>
                  <p className="text-xs uppercase text-[var(--color-muted)]">
                    Notes
                  </p>
                  <p className="text-sm mt-1">{data.notes}</p>
                </div>
              )}

              {data.terms && (
                <div>
                  <p className="text-xs uppercase text-[var(--color-muted)]">
                    Terms
                  </p>
                  <p className="text-sm mt-1">{data.terms}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}