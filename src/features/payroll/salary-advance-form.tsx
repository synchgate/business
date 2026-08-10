import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequestSalaryAdvance } from "@/hooks/use-payroll";
import { useEmployeeList } from "@/hooks/use-payroll";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";

const schema = z.object({
  employee: z.string().min(1, "Select an employee"),
  amount: z.coerce.number().positive("Must be greater than zero"),
  repayment_months: z.coerce.number().int().min(1).max(12),
  reason: z.string().optional(),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function SalaryAdvanceForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const requestAdvance = useRequestSalaryAdvance();
  const { data: employees } = useEmployeeList({ is_active: true });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { repayment_months: 1 },
  });

  const employeeId = watch("employee");

  const onSubmit = async (values: FormValues) => {
    try {
      await requestAdvance.mutateAsync(values);
      toast.success("Advance request submitted.");
      onSuccess();
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't submit the request."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Employee</Label>
        <Select value={employeeId} onValueChange={(v) => setValue("employee", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {(employees ?? []).map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employee && <p className="text-xs text-[var(--color-status-overdue)]">{errors.employee.message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adv_amount">Amount (₦)</Label>
          <Input id="adv_amount" type="number" step="0.01" {...register("amount")} />
          {errors.amount && <p className="text-xs text-[var(--color-status-overdue)]">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adv_months">Repay over (months)</Label>
          <Input id="adv_months" type="number" min={1} max={12} {...register("repayment_months")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adv_reason">Reason (optional)</Label>
        <Textarea id="adv_reason" rows={2} {...register("reason")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
