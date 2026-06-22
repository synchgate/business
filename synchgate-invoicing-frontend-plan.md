# Synchgate Invoicing Frontend — Implementation Plan

This plan is based on a direct read of the `gateway` Django backend (the `invoicing`, `accounts`, `merchants`, and `billing` apps, plus `payinfra/settings`). It documents what the backend actually exposes today, where it diverges from the brief, and the architecture proposed for `invoice.synchgate.com`. Code generation starts once the gaps below are resolved one way or another, since several of them change folder structure and route design.

## 1. What the backend actually exposes

All routes are mounted under `payinfra/urls.py` with these prefixes: `v1/accounts/`, `v1/invoicing/`, `v1/merchants/`, `v1/billing/`, `v1/communications/`, `v1/analytics/`, `v1/api/`, `v1/transactions/`. Only the first four are relevant to invoicing.

**Authentication (`v1/accounts/`)**
`auth/register/` (POST) creates a User + Merchant + a free-tier MerchantSubscription in one transaction, auto-creates a pre-verified KYCDocument stub, and emails an OTP — it does not log the user in or return tokens. `auth/verify-otp/` (POST, purpose `email` or `password`) activates the account. `auth/login/` (POST) returns `access`/`refresh` JWTs plus a small user object (`kyc_status`, `merchant_mode`). `auth/forgot-password/` and `auth/reset-password/` complete the OTP-based reset flow. `profile/update/` (PATCH) and `user/details/` (GET, also aliased as `auth/settings/`) handle the personal profile, separate from the business/merchant profile.

**Merchant & settlement (`v1/merchants/`)**
`merchant/{id}/update/` (PATCH) edits business profile fields (name, email, phone, type, website, address, country, state, registration number). `switch/toggle-merchant-mode/` (PATCH) flips `live_mode`, but the invoicing module never reads this flag — invoices have no sandbox/live distinction, unlike the rest of the platform. `setup/subaccount/` (POST), `setup/verify-account/` (POST), and `setup/account/` (GET) are the Paystack settlement-account onboarding endpoints the brief refers to.

**Invoicing (`v1/invoicing/`)**
`invoices/` supports POST (create, with nested line items and validation that `due_date` isn't in the past) and GET (list, with `status` and `customer_email` query filters, paginated). `invoices/{id}/` is GET-only. `invoices/{id}/send/` (POST) emails and WhatsApps the invoice and marks it `sent`. `invoices/{id}/remind/` (POST) fires a manual reminder. `invoices/{id}/cancel/` (POST) and `invoices/{id}/receipt/` (GET) round out the detail actions. `invoices/analytics/` (GET) returns the dashboard numbers: counts by status, revenue collected, outstanding amount, collection rate, average days-to-payment, and a 12-month collections series. `webhook/paystack/` is the public payment webhook, and `pay/{invoice_number}/` is the public, unauthenticated view a customer hits to see and pay an invoice (currently read-only — it marks the invoice as viewed but has no payment-initiation action of its own; presumably the customer pays via `payment_link`, a Paystack-hosted page).

**Billing (`v1/billing/`)**
This app manages Synchgate's own subscription billing to the *merchant* — `plans/`, `subscriptions/`, `usage/`, `history/`, and a separate `invoices/` resource for the merchant's platform bill. This is a different "invoice" concept from the customer-facing invoices this frontend is for, and the URL collision (`/v1/billing/invoices/` vs `/v1/invoicing/invoices/`) is worth keeping very separate in naming inside the frontend codebase to avoid confusion later.

**Response shape**
Most endpoints return `{ status, message, data, meta: { request_id, timestamp } }` via a shared `success_response`/`error_response` helper, and validation errors from `raise_exception=True` get reshaped by a custom DRF exception handler into `{ status: "error", message, error: { code, details }, meta }`. The one inconsistency: the paginated `invoices/` list endpoint returns DRF's native pagination envelope (`count`, `next`, `previous`, `results`) instead of the `success_response` wrapper, because `InvoiceViewSet.list()` calls `get_paginated_response()` directly. The API client needs to special-case this one endpoint rather than assuming one envelope everywhere.

## 2. Gaps between the brief and the backend

These need a decision before folder/route structure is finalized, since each changes scope.

1. **Edit, delete, and duplicate invoice have no backend route.** `InvoiceViewSet` only mixes in Create, Retrieve, and List — there's no PATCH or DELETE on `invoices/{id}/`. "Duplicate" can be faked client-side (pre-fill the create form from an existing invoice's data and POST as new), but edit and delete genuinely require new backend endpoints or a deliberate decision to drop them from v1 (e.g. only DRAFT invoices become editable once that endpoint exists).
2. **No Customer entity exists.** `customer_name`/`email`/`phone` live directly on each `Invoice` row; there's no `Customer` model, so a "customer directory" can only be a frontend-side aggregation (group invoices by `customer_email`) rather than a real CRUD resource with its own create/edit/delete.
3. **KYC document upload isn't wired up.** Registration auto-creates a `KYCDocument` row with `verified=True` and no file — there's no upload endpoint anywhere in `merchants/urls.py`. The "upload required documents" onboarding step in the brief has nothing to call.
4. **Notification, branding, and invoice-template settings don't exist on the backend.** There's no model or endpoint for any of them — `communications/urls.py` only has `contact/`, `demo-sessions/`, and `support/` (none of which are merchant-facing settings). These would need to be either backend additions or explicitly cut/stubbed as "coming soon" in v1.
5. **No token refresh or logout endpoint is registered**, even though `SIMPLE_JWT` has `ROTATE_REFRESH_TOKENS=True` and a 1-day access-token lifetime. Sessions can be held client-side for a day, but there's no way to silently refresh or to invalidate a token server-side on logout right now.
6. **`invoice.synchgate.com` isn't in `CORS_ALLOWED_ORIGINS` or `CSRF_TRUSTED_ORIGINS`** in `payinfra/settings/base.py` yet — only `synchgate.com`, `staging.synchgate.com`, and a Vercel preview URL are listed. The new subdomain will get CORS-blocked until that's added.
7. **The reminder/overdue-check Celery tasks reference a stale app path.** `invoicing/tasks/reminder_tasks.py` imports from `app_invoicing.models` and `app_invoicing.services.invoice_service`, but the actual app is `invoicing` and the service lives at `modules.services.invoicing`. If these tasks are wired into Celery beat as-is, the automatic pre-due/overdue reminder schedule is currently broken (manual reminders via the `remind` action are unaffected, since that path imports correctly).
8. **"Download" and "Print" invoice have no dedicated backend output.** There's no invoice PDF endpoint (only the post-payment *receipt* gets a generated PDF). These are realistically client-side concerns — render the invoice to PDF in the browser from the JSON payload — rather than backend calls.

None of these block starting the frontend, since auth, merchant/settlement onboarding, invoice create/list/detail/send/remind/cancel, and the analytics dashboard are all solid, real endpoints. They do determine whether "Customers," "Edit Invoice," and "Settings" become full screens, stub screens, or get cut from v1.

## 3. Proposed architecture

```
src/
  api/
    client.ts              # axios instance, base URL, JWT interceptor
    envelope.ts             # unwraps {status,message,data,meta} vs paginated shape
    endpoints/
      auth.ts
      merchant.ts
      settlement.ts
      invoices.ts
      receipts.ts
  types/
    invoice.ts               # generated from InvoiceDetailSerializer/InvoiceListSerializer fields
    merchant.ts
    auth.ts
  features/
    auth/                    # login, register, verify-otp, forgot/reset password
    onboarding/              # business profile + settlement account setup (no doc upload, per gap #3)
    dashboard/               # analytics cards + revenue chart, backed by invoices/analytics/
    invoices/
      list/                  # table, status/customer_email filters, pagination
      create/                # react-hook-form + zod, dynamic line items
      detail/                # status timeline, send/remind/cancel actions, payment link
    customers/                # derived view grouped by customer_email (per gap #2)
    settings/                 # business profile (real) + plan/usage (from billing app); notification/branding/template tabs marked "coming soon" pending gap #4
  components/                 # shadcn-based primitives, shared with the orchestration frontend's design tokens where useful
  routes/                     # react-router route tree
  lib/
    query-client.ts           # TanStack Query setup
    auth-context.tsx          # session persistence (localStorage refresh token, in-memory access token)
```

State management: TanStack Query owns all server data (invoices, analytics, merchant profile, settlement status) with query keys namespaced by merchant id; no separate global store is needed beyond a thin auth context for the current user/merchant and the active JWT. Forms use React Hook Form with Zod schemas mirrored from the DRF serializers above (e.g. `InvoiceCreateSerializer`'s `due_date` not-in-the-past rule, `quantity`/`unit_price` minimums) so invalid submissions are caught client-side before hitting the API.

Routing: a public, unauthenticated branch for `/pay/:invoiceNumber` (mirroring `PublicInvoiceView`) sits outside the authenticated app shell, since customers — not merchants — land there from a payment link with no login. Everything else sits behind an auth guard that checks for a valid access token and redirects to `/login` otherwise.

Design system: the brand color `#F0F5FA` (HSL 210° 50% 96%) is very light, so it reads as a background/surface tone rather than a primary action color in a Stripe/Paystack-style dark-text-on-light-surface fintech UI — the plan is to use it for card and table-row surfaces and pull a darker shade from the same hue for primary buttons/links, rather than using `#F0F5FA` itself for buttons, which would have poor contrast against white.

## 4. Phasing

Phase 1 covers auth (register → verify-otp → login, forgot/reset password) and merchant onboarding (business profile + settlement account setup, skipping document upload per gap #3) — nothing in the rest of the app works without a settlement account, since invoice creation will silently produce a payment-link-less invoice otherwise. Phase 2 is the dashboard (analytics) and invoice list/detail/create, since that's the core product loop. Phase 3 is send/remind/cancel actions plus the public pay page. Phase 4 is settings (business profile editing, plan/usage display) and the customer directory view. Anything tied to gaps #1 and #4 (edit/delete invoice, notification/branding/template settings) waits for either a decision to descope or backend additions.

## 5. Open decisions before code generation starts

- Edit/delete/duplicate invoice (gap #1): drop from v1, or do you want backend PATCH/DELETE routes added first?
- Customer directory (gap #2): ship as a derived/grouped view over existing invoices, or hold off until there's a real Customer model?
- KYC document upload (gap #3): drop from onboarding for v1, or add the backend endpoint first?
- Notification/branding/invoice-template settings (gap #4): stub as "coming soon" tabs, or cut entirely from v1?
- Should I flag gaps #5–#7 (token refresh/logout, CORS allowlist, the broken Celery import path) to fix on the backend in parallel, since #6 will hard-block the deployed frontend from calling the API at all?
