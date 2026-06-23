import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth, RequireGuest, RequireOnboarded } from "@/routes/guards";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage = lazy(() => import("@/features/landing/landing-page").then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("@/features/auth/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/features/auth/register-page").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import("@/features/auth/verify-email-page").then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password-page").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/features/auth/reset-password-page").then((m) => ({ default: m.ResetPasswordPage })));
const SettlementSetupPage = lazy(() => import("@/features/onboarding/settlement-setup-page").then((m) => ({ default: m.SettlementSetupPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const InvoiceListPage = lazy(() => import("@/features/invoices/invoice-list-page").then((m) => ({ default: m.InvoiceListPage })));
const InvoiceCreatePage = lazy(() => import("@/features/invoices/invoice-create-page").then((m) => ({ default: m.InvoiceCreatePage })));
const InvoiceDetailPage = lazy(() => import("@/features/invoices/invoice-detail-page").then((m) => ({ default: m.InvoiceDetailPage })));
const InvoiceEditPage = lazy(() => import("@/features/invoices/invoice-edit-page").then((m) => ({ default: m.InvoiceEditPage })));
const CustomerListPage = lazy(() => import("@/features/customers/customer-list-page").then((m) => ({ default: m.CustomerListPage })));
const CustomerDetailPage = lazy(() => import("@/features/customers/customer-detail-page").then((m) => ({ default: m.CustomerDetailPage })));
const VirtualAccountPage = lazy(() => import("@/features/virtual-account/virtual-account-page").then((m) => ({ default: m.VirtualAccountPage })));
const SettingsPage = lazy(() => import("@/features/settings/settings-page").then((m) => ({ default: m.SettingsPage })));
const PublicInvoicePage = lazy(() => import("@/features/public/public-invoice-page").then((m) => ({ default: m.PublicInvoicePage })));
const NotFoundPage = lazy(() => import("@/features/not-found-page").then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-8">
      <div className="w-full max-w-lg space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function wrap(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  // ── Public marketing home ──────────────────────────────────────
  { path: "/", element: wrap(<LandingPage />) },

  // ── Public invoice pay page (no auth) ─────────────────────────
  { path: "/pay/:invoiceNumber", element: wrap(<PublicInvoicePage />) },

  // ── Guest-only auth pages ─────────────────────────────────────
  {
    element: <RequireGuest />,
    children: [
      { path: "/login", element: wrap(<LoginPage />) },
      { path: "/register", element: wrap(<RegisterPage />) },
      { path: "/verify-email", element: wrap(<VerifyEmailPage />) },
      { path: "/forgot-password", element: wrap(<ForgotPasswordPage />) },
      { path: "/reset-password", element: wrap(<ResetPasswordPage />) },
    ],
  },

  // ── Authenticated routes ───────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      { path: "/onboarding/settlement", element: wrap(<SettlementSetupPage />) },
      {
        element: <RequireOnboarded />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: "/dashboard", element: wrap(<DashboardPage />), handle: { title: "Dashboard" } },

              // Invoices
              { path: "/invoices", element: wrap(<InvoiceListPage />), handle: { title: "Invoices" } },
              { path: "/invoices/new", element: wrap(<InvoiceCreatePage />), handle: { title: "New invoice" } },
              { path: "/invoices/:id", element: wrap(<InvoiceDetailPage />), handle: { title: "Invoice" } },
              { path: "/invoices/:id/edit", element: wrap(<InvoiceEditPage />), handle: { title: "Edit invoice" } },

              // Virtual account
              { path: "/virtual-account", element: wrap(<VirtualAccountPage />), handle: { title: "Virtual Account" } },

              // Customers
              { path: "/customers", element: wrap(<CustomerListPage />), handle: { title: "Customers" } },
              { path: "/customers/:id", element: wrap(<CustomerDetailPage />), handle: { title: "Customer" } },

              // Settings
              { path: "/settings", element: wrap(<SettingsPage />), handle: { title: "Settings" } },

              // Redirect /app → /dashboard
              { path: "/app", element: <Navigate to="/dashboard" replace /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: wrap(<NotFoundPage />) },
]);
