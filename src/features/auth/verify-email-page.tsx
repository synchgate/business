import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyOtp } from "@/api/endpoints/auth";
import { readErrorMessage } from "@/api/envelope";
import { toast } from "@/components/ui/toaster";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "Enter the 6-digit code"),
});
type FormValues = z.infer<typeof schema>;

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillEmail = (location.state as { email?: string })?.email ?? "";
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: prefillEmail } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await verifyOtp({ email: values.email, purpose: "email", otp: values.otp });
      toast.success("Email verified — you can log in now.");
      navigate("/login");
    } catch (err) {
      setServerError(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "That code didn't work. Check it and try again.",
        ),
      );
    }
  };

  return (
    <AuthLayout title="Verify your email" description="Enter the 6-digit code we emailed you.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="otp">Verification code</Label>
          <Input id="otp" inputMode="numeric" maxLength={6} placeholder="000000" {...register("otp")} />
          {errors.otp && <p className="text-xs text-[var(--color-status-overdue)]">{errors.otp.message}</p>}
        </div>
        {serverError && <p className="text-sm text-[var(--color-status-overdue)]">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Verify email"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-body)]">
        <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
