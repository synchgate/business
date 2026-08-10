import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreatePayrollRun } from "@/hooks/use-payroll";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";

const schema = z
  .object({
    period_start: z.string().min(1, "Required"),
    period_end: z.string().min(1, "Required"),
  })
  .refine((v) => v.period_end >= v.period_start, {
    message: "End date must be after start date",
    path: ["period_end"],
  });
type FormValues = z.infer<typeof schema>;

export function PayrollRunCreateForm({ onCancel }: { onCancel: () => void }) {
  const createRun = useCreatePayrollRun();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const run = await createRun.mutateAsync(values);
      toast.success("Payroll run created. Review payslips before submitting.");
      navigate(`/payroll/runs/${run.id}`);
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't create payroll run."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-[var(--color-body)]">
        This generates a draft payslip for every active employee based on their base salary. You'll review the totals
        before submitting for approval.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="period_start">Period start</Label>
          <Input id="period_start" type="date" {...register("period_start")} />
          {errors.period_start && <p className="text-xs text-[var(--color-status-overdue)]">{errors.period_start.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="period_end">Period end</Label>
          <Input id="period_end" type="date" {...register("period_end")} />
          {errors.period_end && <p className="text-xs text-[var(--color-status-overdue)]">{errors.period_end.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create draft run"}
        </Button>
      </div>
    </form>
  );
}
