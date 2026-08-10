import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-payroll";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { EMPLOYMENT_TYPE_LABEL, type EmployeeDetail, type EmploymentType, type PayFrequency } from "@/types/payroll";

const schema = z.object({
  full_name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  job_title: z.string().min(1, "Required"),
  department: z.string().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "intern"]),
  pay_frequency: z.enum(["monthly", "weekly", "biweekly"]),
  base_salary: z.coerce.number().positive("Must be greater than zero"),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
  tin: z.string().optional(),
  pension_pin: z.string().optional(),
  start_date: z.string().min(1, "Required"),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function EmployeeForm({
  existing,
  onSuccess,
  onCancel,
}: {
  existing?: EmployeeDetail;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const isEdit = !!existing;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          full_name: existing.full_name,
          email: existing.email ?? "",
          phone: existing.phone ?? "",
          job_title: existing.job_title,
          department: existing.department ?? "",
          employment_type: existing.employment_type,
          pay_frequency: existing.pay_frequency,
          base_salary: Number(existing.base_salary),
          bank_name: existing.bank_name ?? "",
          bank_account_number: existing.bank_account_number ?? "",
          bank_account_name: existing.bank_account_name ?? "",
          tin: existing.tin ?? "",
          pension_pin: existing.pension_pin ?? "",
          start_date: existing.start_date,
        }
      : { employment_type: "full_time", pay_frequency: "monthly" },
  });

  const employmentType = watch("employment_type");
  const payFrequency = watch("pay_frequency");

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && existing) {
        await updateEmployee.mutateAsync({ id: existing.id, input: values });
        toast.success("Employee updated.");
      } else {
        await createEmployee.mutateAsync(values);
        toast.success("Employee added.");
      }
      onSuccess();
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          `Couldn't ${isEdit ? "update" : "add"} the employee.`,
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="e_name">Full name</Label>
          <Input id="e_name" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_title">Job title</Label>
          <Input id="e_title" {...register("job_title")} />
          {errors.job_title && <p className="text-xs text-[var(--color-status-overdue)]">{errors.job_title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_email">Email (for payslips)</Label>
          <Input id="e_email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_phone">Phone</Label>
          <Input id="e_phone" {...register("phone")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_department">Department</Label>
          <Input id="e_department" {...register("department")} />
        </div>

        <div className="space-y-1.5">
          <Label>Employment type</Label>
          <Select value={employmentType} onValueChange={(v) => setValue("employment_type", v as EmploymentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Pay frequency</Label>
          <Select value={payFrequency} onValueChange={(v) => setValue("pay_frequency", v as PayFrequency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_salary">Base salary (₦)</Label>
          <Input id="e_salary" type="number" step="0.01" {...register("base_salary")} />
          {errors.base_salary && (
            <p className="text-xs text-[var(--color-status-overdue)]">{errors.base_salary.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e_start">Start date</Label>
          <Input id="e_start" type="date" {...register("start_date")} />
          {errors.start_date && <p className="text-xs text-[var(--color-status-overdue)]">{errors.start_date.message}</p>}
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Payout details
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e_bank_name">Bank name</Label>
            <Input id="e_bank_name" {...register("bank_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e_acct_no">Account number</Label>
            <Input id="e_acct_no" {...register("bank_account_number")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="e_acct_name">Account name</Label>
            <Input id="e_acct_name" {...register("bank_account_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e_tin">TIN (for PAYE)</Label>
            <Input id="e_tin" {...register("tin")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e_pension">Pension PIN</Label>
            <Input id="e_pension" {...register("pension_pin")} />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          PAYE and pension are only calculated on payslips for employees with a TIN / Pension PIN on file.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}
