import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register as registerRequest } from "@/api/endpoints/auth";
import { readErrorMessage } from "@/api/envelope";

// Mirrors accounts/serializers/auth.py RegisterSerializer constraints exactly
// (password min_length=6, business_phone/business_name min_length=6).
const schema = z.object({
  business_name: z.string().min(6, "Business name must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  business_phone: z.string().min(6, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await registerRequest(values);
      navigate("/verify-email", { state: { email: values.email } });
    } catch (err) {
      setServerError(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't create your account. Check your details and try again.",
        ),
      );
    }
  };

  return (
    <AuthLayout title="Create your business account" description="Set up Synchgate Invoicing for your business.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" {...register("first_name")} />
            {errors.first_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" {...register("last_name")} />
            {errors.last_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.last_name.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="business_name">Business name</Label>
          <Input id="business_name" placeholder="Acme Stores Ltd" {...register("business_name")} />
          {errors.business_name && <p className="text-xs text-[var(--color-status-overdue)]">{errors.business_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@business.com" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="business_phone">Business phone</Label>
          <Input id="business_phone" placeholder="+234…" {...register("business_phone")} />
          {errors.business_phone && <p className="text-xs text-[var(--color-status-overdue)]">{errors.business_phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-[var(--color-status-overdue)]">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-[var(--color-status-overdue)]">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-body)]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
