import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NIGERIAN_BANKS } from "@/lib/banks";
import { setupSettlementAccount, verifyBankAccount } from "@/api/endpoints/merchant";
import { readErrorMessage } from "@/api/envelope";
import type { AccountVerifyResult } from "@/types/auth";

const schema = z.object({
  bank_code: z.string().min(1, "Select a bank"),
  account_number: z.string().min(10, "Enter a valid 10-digit account number").max(10),
});
type FormValues = z.infer<typeof schema>;

export function SettlementSetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [verified, setVerified] = useState<AccountVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const bankCode = watch("bank_code");

  const verifyMutation = useMutation({
    mutationFn: (values: FormValues) => verifyBankAccount(values),
    onSuccess: (result) => {
      setVerified(result);
      setError(null);
    },
    onError: (err) => {
      setVerified(null);
      setError(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't verify that account."));
    },
  });

  const setupMutation = useMutation({
    mutationFn: (values: FormValues) =>
      setupSettlementAccount({ settlement_bank: values.bank_code, account_number: values.account_number }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", "settlementAccount"] });
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      setError(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't set up your settlement account."));
    },
  });

  const onVerify = (values: FormValues) => {
    setError(null);
    verifyMutation.mutate(values);
  };

  const onConfirm = () => {
    const values = { bank_code: bankCode, account_number: watch("account_number") };
    setupMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="mb-6 space-y-1">
            <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              Set up settlements
            </h1>
            <p className="text-sm text-[var(--color-body)]">
              Add the bank account your invoice payments should settle to. This only takes a minute.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onVerify)}>
            <div className="space-y-1.5">
              <Label>Bank</Label>
              <Select value={bankCode} onValueChange={(v) => setValue("bank_code", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_BANKS.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank_code && <p className="text-xs text-[var(--color-status-overdue)]">{errors.bank_code.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account_number">Account number</Label>
              <Input
                id="account_number"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                {...register("account_number")}
                onChange={(e) => {
                  register("account_number").onChange(e);
                  setVerified(null);
                }}
              />
              {errors.account_number && (
                <p className="text-xs text-[var(--color-status-overdue)]">{errors.account_number.message}</p>
              )}
            </div>

            {verified ? (
              <div className="flex items-center gap-2 rounded-[var(--radius-chip)] bg-[color-mix(in_srgb,var(--color-status-paid)_12%,transparent)] px-3 py-2 text-sm text-[var(--color-status-paid)]">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Verified: <span className="font-medium">{verified.account_name}</span>
                </span>
              </div>
            ) : (
              <Button type="submit" variant="secondary" className="w-full" disabled={verifyMutation.isPending}>
                {verifyMutation.isPending ? "Verifying…" : "Verify account"}
              </Button>
            )}

            {error && <p className="text-sm text-[var(--color-status-overdue)]">{error}</p>}

            {verified && (
              <Button type="button" className="w-full" onClick={onConfirm} disabled={setupMutation.isPending}>
                {setupMutation.isPending ? "Setting up…" : "Confirm & continue"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
