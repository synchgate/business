import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth, RequireGuest, RequireOnboarded } from "@/routes/guards";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage         = lazy(() => import("@/features/landing/landing-page").then((m) => ({ default: m.LandingPage })));
const LoginPage           = lazy(() => import("@/features/auth/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage        = lazy(() => import("@/features/auth/register-page").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage     = lazy(() => import("@/features/auth/verify-email-page").then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage  = lazy(() => import("@/features/auth/forgot-password-page").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage   = lazy(() => import("@/features/auth/reset-password-page").then((m) => ({ default: m.ResetPasswordPage })));
const SettlementSetupPage = lazy(() => import("@/features/onboarding/settlement-setup-page").then((m) => ({ default: m.SettlementSetupPage })));
const DashboardPage       = lazy(() => import("@/features/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));

// Invoices
const InvoiceListPage   = lazy(() => import("@/features/invoices/invoice-list-page").then((m) => ({ default: m.InvoiceListPage })));
const InvoiceCreatePage = lazy(() => import("@/features/invoices/invoice-create-page").then((m) => ({ default: m.InvoiceCreatePage })));
const InvoiceDetailPage = lazy(() => import("@/features/invoices/invoice-detail-page").then((m) => ({ default: m.InvoiceDetailPage })));
const InvoiceEditPage   = lazy(() => import("@/features/invoices/invoice-edit-page").then((m) => ({ default: m.InvoiceEditPage })));

// Quotations
const QuotationListPage   = lazy(() => import("@/features/quotations/quotation-list-page").then((m) => ({ default: m.QuotationListPage })));
const QuotationCreatePage = lazy(() => import("@/features/quotations/quotation-create-page").then((m) => ({ default: m.QuotationCreatePage })));
const QuotationDetailPage = lazy(() => import("@/features/quotations/quotation-detail-page").then((m) => ({ default: m.QuotationDetailPage })));
const QuotationEditPage   = lazy(() => import("@/features/quotations/quotation-edit-page").then((m) => ({ default: m.QuotationEditPage })));

// Customers
const CustomerListPage   = lazy(() => import("@/features/customers/customer-list-page").then((m) => ({ default: m.CustomerListPage })));
const CustomerDetailPage = lazy(() => import("@/features/customers/customer-detail-page").then((m) => ({ default: m.CustomerDetailPage })));

// Other
const VirtualAccountPage = lazy(() => import("@/features/virtual-account/virtual-account-page").then((m) => ({ default: m.VirtualAccountPage })));
const SettingsPage       = lazy(() => import("@/features/settings/settings-page").then((m) => ({ default: m.SettingsPage })));

// Public (no auth)
const PublicInvoicePage   = lazy(() => import("@/features/public/public-invoice-page").then((m) => ({ default: m.PublicInvoicePage })));
const PublicQuotationPage = lazy(() => import("@/features/public/public-quotation-page").then((m) => ({ default: m.PublicQuotationPage })));

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

  // ── Public pages (no auth) ────────────────────────────────────
  { path: "/invoice/:invoiceNumber",   element: wrap(<PublicInvoicePage />) },
  { path: "/quote/:quoteNumber",   element: wrap(<PublicQuotationPage />) },

  // ── Guest-only auth pages ─────────────────────────────────────
  {
    element: <RequireGuest />,
    children: [
      { path: "/login",            element: wrap(<LoginPage />) },
      { path: "/register",         element: wrap(<RegisterPage />) },
      { path: "/verify-email",     element: wrap(<VerifyEmailPage />) },
      { path: "/forgot-password",  element: wrap(<ForgotPasswordPage />) },
      { path: "/reset-password",   element: wrap(<ResetPasswordPage />) },
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
              { path: "/invoices",          element: wrap(<InvoiceListPage />),   handle: { title: "Invoices" } },
              { path: "/invoices/new",      element: wrap(<InvoiceCreatePage />), handle: { title: "New invoice" } },
              { path: "/invoices/:id",      element: wrap(<InvoiceDetailPage />), handle: { title: "Invoice" } },
              { path: "/invoices/:id/edit", element: wrap(<InvoiceEditPage />),   handle: { title: "Edit invoice" } },

              // Quotations
              { path: "/quotes",          element: wrap(<QuotationListPage />),   handle: { title: "Quotations" } },
              { path: "/quotes/new",      element: wrap(<QuotationCreatePage />), handle: { title: "New quotation" } },
              { path: "/quotes/:id",      element: wrap(<QuotationDetailPage />), handle: { title: "Quotation" } },
              { path: "/quotes/:id/edit", element: wrap(<QuotationEditPage />),   handle: { title: "Edit quotation" } },

              // Virtual account
              { path: "/virtual-account", element: wrap(<VirtualAccountPage />), handle: { title: "Virtual Account" } },

              // Customers
              { path: "/customers",     element: wrap(<CustomerListPage />),   handle: { title: "Customers" } },
              { path: "/customers/:id", element: wrap(<CustomerDetailPage />), handle: { title: "Customer" } },

              // Settings
              { path: "/settings", element: wrap(<SettingsPage />), handle: { title: "Settings" } },

              { path: "/app", element: <Navigate to="/dashboard" replace /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: wrap(<NotFoundPage />) },
]);
