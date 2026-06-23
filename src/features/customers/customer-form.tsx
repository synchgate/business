import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";
import type { CustomerDetail, CustomerType } from "@/types/customer";

const schema = z.object({
  customer_type: z.enum(["individual", "business"]),
  name: z.string().min(1, "Required"),
  business_name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address_line: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  existing?: CustomerDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ existing, onSuccess, onCancel }: CustomerFormProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEdit = !!existing;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          customer_type: existing.customer_type,
          name: existing.name,
          business_name: existing.business_name ?? "",
          email: existing.email,
          phone: existing.phone ?? "",
          address_line: existing.address_line ?? "",
          city: existing.city ?? "",
          state: existing.state ?? "",
          country: existing.country ?? "",
          notes: existing.notes ?? "",
        }
      : { customer_type: "individual" },
  });

  const customerType = watch("customer_type");

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && existing) {
        await updateCustomer.mutateAsync({ id: existing.id, input: values });
        toast.success("Customer updated.");
      } else {
        await createCustomer.mutateAsync({
          ...values,
          business_name: values.customer_type === "business" ? values.business_name : undefined,
        });
        toast.success("Customer added.");
      }
      onSuccess();
    } catch (err) {
      toast.error(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          `Couldn't ${isEdit ? "update" : "add"} the customer.`,
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Customer type</Label>
        <Select
          value={customerType}
          onValueChange={(v) => setValue("customer_type", v as CustomerType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c_name">Full name</Label>
          <Input id="c_name" {...register("name")} />
          {errors.name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.name.message}</p>}
        </div>

        {customerType === "business" && (
          <div className="space-y-1.5">
            <Label htmlFor="business_name">Business name</Label>
            <Input id="business_name" {...register("business_name")} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="c_email">Email</Label>
          <Input id="c_email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c_phone">Phone (optional)</Label>
          <Input id="c_phone" {...register("phone")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c_city">City</Label>
          <Input id="c_city" {...register("city")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c_state">State</Label>
          <Input id="c_state" {...register("state")} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="c_address">Address</Label>
          <Input id="c_address" {...register("address_line")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c_notes">Notes (internal)</Label>
        <Textarea id="c_notes" {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </form>
  );
}
