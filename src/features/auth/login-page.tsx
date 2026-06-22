import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { readErrorMessage } from "@/api/envelope";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      const redirectTo = (location.state as { from?: string })?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The backend can't distinguish "wrong password" from "email not
      // verified yet" here — both come back as a generic 400 "Invalid
      // credentials" (LoginSerializer authenticates against is_active users
      // only and raises the same error either way). Hence the verify-email
      // link below rather than trying to branch on this error.
      setServerError(
        readErrorMessage(
          (err as { response?: { data?: unknown } }).response?.data,
          "Couldn't log you in. Check your details and try again.",
        ),
      );
    }
  };

  return (
    <AuthLayout title="Log in" description="Welcome back to Synchgate Invoicing.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@business.com" {...register("email")} />
          {errors.email && <p className="text-xs text-[var(--color-status-overdue)]">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-[var(--color-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-[var(--color-status-overdue)]">{errors.password.message}</p>}
        </div>
        {serverError && (
          <p className="text-sm text-[var(--color-status-overdue)]">
            {serverError}{" "}
            <Link to="/verify-email" className="underline hover:no-underline">
              Need to verify your email?
            </Link>
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-body)]">
        New to Synchgate?{" "}
        <Link to="/register" className="font-medium text-[var(--color-primary)] hover:underline">
          Create a business account
        </Link>
      </p>
    </AuthLayout>
  );
}
