import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequirePermission } from "@/components/team/require-permission";
import { usePermission } from "@/hooks/use-team";
import { useTaxProfile, useUpdateTaxProfile } from "@/hooks/use-compliance";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";

const schema = z.object({
  tin: z.string().optional(),
  rc_number: z.string().optional(),
  vat_registered: z.boolean(),
  vat_number: z.string().optional(),
  filing_state: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function TaxProfileForm() {
  const { data: profile, isLoading } = useTaxProfile();
  const updateProfile = useUpdateTaxProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vat_registered: false },
  });

  useEffect(() => {
    if (profile) {
      reset({
        tin: profile.tin,
        rc_number: profile.rc_number,
        vat_registered: profile.vat_registered,
        vat_number: profile.vat_number,
        filing_state: profile.filing_state,
      });
    }
  }, [profile, reset]);

  const vatRegistered = watch("vat_registered");
  const canManage = usePermission("tax.manage");

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success("Tax profile updated.");
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't update tax profile."));
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax profile</CardTitle>
        <CardDescription>Used to generate accurate VAT, PAYE, and pension reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tin">TIN (FIRS Tax ID)</Label>
              <Input id="tin" disabled={!canManage} {...register("tin")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rc_number">CAC registration number</Label>
              <Input id="rc_number" disabled={!canManage} {...register("rc_number")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filing_state">Filing state</Label>
              <Input id="filing_state" disabled={!canManage} {...register("filing_state")} placeholder="e.g. Lagos" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] p-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">VAT registered</p>
              <p className="text-xs text-[var(--color-muted)]">Toggle on once you've registered for VAT with FIRS.</p>
            </div>
            <Switch
              checked={vatRegistered}
              disabled={!canManage}
              onCheckedChange={(v) => setValue("vat_registered", v, { shouldDirty: true })}
            />
          </div>

          {vatRegistered && (
            <div className="space-y-1.5">
              <Label htmlFor="vat_number">VAT number</Label>
              <Input id="vat_number" disabled={!canManage} {...register("vat_number")} />
            </div>
          )}

          <RequirePermission code="tax.manage">
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </RequirePermission>
        </form>
      </CardContent>
    </Card>
  );
}
