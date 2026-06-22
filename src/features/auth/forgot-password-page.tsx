import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/api/endpoints/auth";
import { readErrorMessage } from "@/api/envelope";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
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
      await forgotPassword(values);
      navigate("/reset-password", { state: { email: values.email } });
    } catch (err) {
      setServerError(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't send a reset code. Try again.",
        ),
      );
    }
  };

  return (
    <AuthLayout title="Reset your password" description="We'll email you a code to reset it.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>
        {serverError && <p className="text-sm text-[var(--color-status-overdue)]">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset code"}
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
