import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateTaxReport } from "@/hooks/use-compliance";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import type { TaxReportType } from "@/types/compliance";

const schema = z
  .object({
    report_type: z.enum(["vat", "paye", "pension"]),
    period_start: z.string().min(1, "Required"),
    period_end: z.string().min(1, "Required"),
  })
  .refine((v) => v.period_end >= v.period_start, {
    message: "End date must be after start date",
    path: ["period_end"],
  });
type FormValues = z.infer<typeof schema>;
type GeneratableReportType = Extract<TaxReportType, "vat" | "paye" | "pension">;

export function GenerateReportForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const generateReport = useGenerateTaxReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { report_type: "vat" },
  });

  const reportType = watch("report_type");

  const onSubmit = async (values: FormValues) => {
    try {
      await generateReport.mutateAsync(values);
      toast.success("Tax report generated.");
      onSuccess();
    } catch (err) {
      toast.error(readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't generate report."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Report type</Label>
        <Select value={reportType} onValueChange={(v) => setValue("report_type", v as GeneratableReportType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vat">VAT — from your invoices</SelectItem>
            <SelectItem value="paye">PAYE — from payroll</SelectItem>
            <SelectItem value="pension">Pension — from payroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rep_start">Period start</Label>
          <Input id="rep_start" type="date" {...register("period_start")} />
          {errors.period_start && <p className="text-xs text-[var(--color-status-overdue)]">{errors.period_start.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rep_end">Period end</Label>
          <Input id="rep_end" type="date" {...register("period_end")} />
          {errors.period_end && <p className="text-xs text-[var(--color-status-overdue)]">{errors.period_end.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Generating…" : "Generate report"}
        </Button>
      </div>
    </form>
  );
}
