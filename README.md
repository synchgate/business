# Synchgate Invoicing Frontend

React + Vite + TypeScript frontend for `invoice.synchgate.com`, built directly against the `invoicing`, `accounts`, and `merchants` Django apps in the `gateway` backend. See `synchgate-invoicing-frontend-plan.md` (shared alongside this app) for the full backend analysis this was built from.

## Stack

React 19, Vite, TypeScript, React Router 7, TanStack Query, Axios, Tailwind CSS v4, React Hook Form + Zod, Radix UI primitives (hand-built shadcn-style components — the shadcn CLI registry isn't reachable from this environment, so `src/components/ui/*` is written by hand in the same pattern), Recharts, sonner for toasts.

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

`npm run build` type-checks (`tsc -b`) and produces a production build in `dist/`. `npm run lint` runs ESLint.

## Before deploying this

The backend has a few gaps that affect this frontend directly — fix these on the backend side, nothing here needs to change once they are:

1. **CORS**: `invoice.synchgate.com` isn't in `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` in `payinfra/settings/base.py` yet. Without this, every request from the deployed frontend gets blocked.
2. **Token refresh**: there's no `/v1/accounts/auth/refresh/` endpoint, so sessions just last the access token's lifetime (1 day) and then sign the user out. `src/lib/session.ts` already stores the refresh token for when this exists.
3. **Reminder Celery tasks**: `invoicing/tasks/reminder_tasks.py` imports from `app_invoicing.*`, which doesn't exist — the real app is `invoicing` / `modules.services.invoicing`. If this is wired into Celery beat as-is, scheduled reminders aren't actually running. Manual reminders (the "Remind" button) are unaffected.
4. **Logo asset**: the uploaded `synch.png` has no usable image data — it's solid black-on-black (max pixel brightness ~59/255), so it renders as a black box on any background. `src/components/logo.tsx` is a placeholder text/monogram wordmark until a real asset (transparent or light background) is available; nothing else needs to change when you swap it in.

## Known product gaps (not bugs — see the implementation plan for the decisions behind these)

Edit and delete invoice are wired up end-to-end on the frontend (`PATCH`/`DELETE` on `invoicing/invoices/{id}/`) but the backend doesn't expose those routes yet — `InvoiceViewSet` only mixes Create/Retrieve/List. Until the routes exist, the UI shows a "coming soon" toast instead of erroring. Once they ship, this works with no frontend changes.

The customer directory (`/customers`) is a client-side aggregation over invoices grouped by `customer_email`, since there's no Customer model on the backend. It's capped at the first 10 pages of invoices (200 records) to avoid unbounded requests for merchants with very large histories.

Settings has Notifications, Branding, and Invoice template tabs that are intentionally stubbed as "coming soon" — there's no backend support for any of the three yet (no models, no endpoints).

"Print / Download PDF" on the invoice detail page uses the browser's native print dialog (which includes "Save as PDF") rather than a generated file, since the backend only generates PDFs for post-payment *receipts*, not for invoices themselves.

KYC document upload was dropped from onboarding — registration auto-creates a pre-verified `KYCDocument` row server-side and there's no upload endpoint to call.

## Project layout

`api/` is the HTTP layer — `client.ts` (axios + auth header + 401 handling), `envelope.ts` (the two response shapes the backend uses), `endpoints/*` (one file per backend app). `types/` mirrors the DRF serializers directly. `hooks/` holds the TanStack Query hooks each feature uses. `features/*` is one folder per screen group, matching the route tree in `routes/router.tsx`. `components/ui/*` are the shared primitives; `components/layout/*` is the authenticated app shell (sidebar/topbar); everything else in `components/` is feature-specific but reusable.
