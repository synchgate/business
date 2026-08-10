import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTeamInvite } from "@/hooks/use-team";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/types/team";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "manager", "accountant", "staff"]),
});
type FormValues = z.infer<typeof schema>;
type AssignableRole = FormValues["role"];

export function InviteForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createInvite = useCreateTeamInvite();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "staff" },
  });

  const role = watch("role");

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvite.mutateAsync(values);
      toast.success(`Invite sent to ${values.email}.`);
      onSuccess();
    } catch (err) {
      toast.error(
        readErrorMessage((err as { response?: { data?: unknown } }).response?.data, "Couldn't send the invite."),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="invite_email">Email address</Label>
        <Input id="invite_email" type="email" placeholder="teammate@company.com" {...register("email")} />
        {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setValue("role", v as AssignableRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-[var(--color-muted)]">
          {role === "admin" && "Full access except billing and ownership transfer."}
          {role === "manager" && "Runs payroll and manages invoicing, but can't approve payouts."}
          {role === "accountant" && "Views payroll and manages tax & compliance reports."}
          {role === "staff" && "Limited access — can request salary advances only, by default."}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send invite"}
        </Button>
      </div>
    </form>
  );
}
