import { useState } from "react";
import {
  Building2,
  Copy,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualAccount, useCreateVirtualAccount } from "@/hooks/use-virtual-account";
import { toast } from "@/components/ui/toaster";
import { readErrorMessage } from "@/api/envelope";
import { formatDate } from "@/lib/format";

function AccountNumberDisplay({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3">
      <span className="font-ledger text-3xl font-bold tracking-widest text-[var(--color-ink)]">
        {number.replace(/(\d{4})(\d{4})(\d{2})/, "$1 $2 $3")}
      </span>
      <button
        onClick={copy}
        className="rounded-[var(--radius-chip)] p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
        aria-label="Copy account number"
      >
        {copied ? (
          <CheckCircle2 className="size-4 text-[var(--color-status-paid)]" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}

export function VirtualAccountPage() {
  const { virtualAccount, isLoading, isError, refetch } = useVirtualAccount();
  const createAccount = useCreateVirtualAccount();

  const handleCreate = async () => {
    try {
      await createAccount.mutateAsync();
      toast.success("Virtual account created successfully!");
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't create your virtual account.",
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Virtual Account
        </h2>
        <p className="text-sm text-[var(--color-body)]">
          Your dedicated business bank account number for receiving transfers directly.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-48" />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="size-8 text-[var(--color-status-overdue)]" />
            <p className="text-sm text-[var(--color-body)]">
              Couldn't load your virtual account.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : virtualAccount ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                    <Building2 className="size-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                      Your business account
                    </p>
                    <p className="font-display text-base font-semibold text-[var(--color-ink)]">
                      {virtualAccount.account_name}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    virtualAccount.active
                      ? "bg-[color-mix(in_srgb,var(--color-status-paid)_12%,transparent)] text-[var(--color-status-paid)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-muted)]"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {virtualAccount.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Account number
                </p>
                <AccountNumberDisplay number={virtualAccount.dedicated_account_number} />
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Bank</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      {virtualAccount.bank_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Account name</p>
                    <p className="font-medium text-[var(--color-ink)]">
                      {virtualAccount.account_name}
                    </p>
                  </div>
                  {virtualAccount.customer_code && (
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">Customer code</p>
                      <p className="font-ledger text-sm text-[var(--color-ink)]">
                        {virtualAccount.customer_code}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Created</p>
                    <p className="text-sm text-[var(--color-ink)]">
                      {formatDate(virtualAccount.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(virtualAccount.dedicated_account_number);
                    toast.success("Account number copied.");
                  }}
                >
                  <Copy className="size-4" />
                  Copy account number
                </Button>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="size-4" />
                  Refresh
                </Button> */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to receive payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--color-body)]">
              {[
                "Share your account number with anyone who needs to pay you — they can transfer from any Nigerian bank.",
                "Payments are received instantly and settled to your configured settlement account.",
                "You'll see all incoming transfers in your transaction history.",
                "This account works in addition to your Paystack invoice payment links.",
              ].map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-semibold text-[var(--color-primary)]">
                    {i + 1}
                  </span>
                  <p>{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        /* No virtual account yet — create CTA */
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              <Building2 className="size-8 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-2">
              <p className="font-display text-lg font-semibold text-[var(--color-ink)]">
                No virtual account yet
              </p>
              <p className="max-w-sm text-sm text-[var(--color-body)]">
                Create a dedicated bank account number so your customers can transfer money directly to your business.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleCreate}
                disabled={createAccount.isPending}
              >
                {createAccount.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Requesting your account…
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" />
                    Request virtual account
                  </>
                )}
              </Button>
              <p className="text-xs text-[var(--color-muted)]">
                Powered by Paystack · Requires settlement account to be configured
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}