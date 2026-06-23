import { Link } from "react-router-dom";
import {
  FileText,
  Send,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  ChevronRight,
  Wallet,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

// ── Feature cards ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    label: "Invoicing",
    description: "Create professional invoices, send them instantly, and collect payments via Paystack.",
    badge: "Live",
    badgeColor: "var(--color-status-paid)",
    href: "/invoices",
  },
  {
    icon: Wallet,
    label: "Virtual Accounts",
    description: "Get a dedicated business bank account number for seamless payment collection.",
    badge: "Live",
    badgeColor: "var(--color-status-paid)",
    href: "/virtual-account",
  },
  {
    icon: Users,
    label: "Payroll",
    description: "Pay your team on time, every time. Automated payroll processing across Nigeria.",
    badge: "Coming soon",
    badgeColor: "var(--color-status-partially_paid)",
    href: "#",
  },
  {
    icon: Send,
    label: "Send & Receive Money",
    description: "Business transfers, bulk payments, and collections — all in one place.",
    badge: "Coming soon",
    badgeColor: "var(--color-status-partially_paid)",
    href: "#",
  },
];

// ── Why Synchgate stats ───────────────────────────────────────────
const STATS = [
  { value: "₦0", label: "Monthly fees" },
  { value: "<1min", label: "To create an invoice" },
  { value: "2", label: "Clicks to get a virtual account" },
  { value: "100%", label: "API-first platform" },
];

// ── How it works steps ────────────────────────────────────────────
const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up with your business email. We auto-create your business profile.",
  },
  {
    step: "02",
    title: "Set up your settlement account",
    description: "Add the bank account your payments should settle to — takes under 2 minutes.",
  },
  {
    step: "03",
    title: "Start collecting",
    description: "Create invoices, share payment links, and get a dedicated virtual account number.",
  },
];

// ── Trusted-by logos (placeholder text) ──────────────────────────
const TRUST_MARKS = [
  "Backed by Paystack infrastructure",
  "Bank-grade security",
  "PCI DSS compliant",
  "SOC 2 Type II",
];

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-body)] md:flex">
            <a href="#features" className="hover:text-[var(--color-ink)]">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--color-ink)]">How it works</a>
            <a href="#pricing" className="hover:text-[var(--color-ink)]">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-[var(--radius-chip)] p-2 text-[var(--color-body)] hover:bg-[var(--color-surface-muted)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
        {/* Decorative background orbs */}
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            <Zap className="size-3" />
            The banking platform built for African businesses
          </div>
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-[var(--color-ink)] md:text-6xl">
            Run your entire{" "}
            <span style={{ color: "var(--color-primary)" }}>business finances</span>{" "}
            in one place
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--color-body)] md:text-xl">
            Synchgate gives African businesses a complete financial operating system — professional invoicing, virtual bank accounts, payroll, and business payments, all connected.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Start for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">Log into dashboard</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)]">No credit card required · Free forever for core features</p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-1 px-6 py-6 text-center">
              <p className="font-display text-2xl font-bold text-[var(--color-primary)] md:text-3xl">{stat.value}</p>
              <p className="text-xs text-[var(--color-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] md:text-4xl">
              Everything your business needs
            </h2>
            <p className="mt-3 text-[var(--color-body)]">
              One platform, all your financial workflows — starting with invoicing and virtual accounts.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {FEATURES.map((feature) => {
              const isLive = feature.badge === "Live";
              return (
                <div
                  key={feature.label}
                  className={`group relative rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-md ${!isLive ? "opacity-80" : ""}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="flex size-11 items-center justify-center rounded-[var(--radius-chip)]"
                      style={{ background: "var(--color-primary-soft)" }}
                    >
                      <feature.icon className="size-5" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${feature.badgeColor} 14%, transparent)`,
                        color: feature.badgeColor,
                      }}
                    >
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">{feature.label}</h3>
                  <p className="mb-4 text-sm text-[var(--color-body)]">{feature.description}</p>
                  {isLive ? (
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Get started
                      <ChevronRight className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="text-sm text-[var(--color-muted)]">Notify me when live →</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Invoicing feature deep-dive ───────────────────────────── */}
      <section className="bg-[var(--color-surface)] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                Invoicing — Live now
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] md:text-4xl">
                Get paid faster with professional invoices
              </h2>
              <p className="mt-4 text-[var(--color-body)]">
                Create detailed invoices with line items, taxes, and discounts. Send via email and WhatsApp in one click. Customers pay through a secure Paystack payment link — no login required.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Automatic payment reminders",
                  "Real-time payment tracking",
                  "PDF receipts on payment",
                  "Customer directory",
                  "Revenue analytics dashboard",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-[var(--color-body)]">
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--color-status-paid)]" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/register">
                    Start invoicing free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mock invoice card */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-canvas)] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-ledger text-sm font-medium text-[var(--color-ink)]">INV-0042</p>
                  <p className="text-xs text-[var(--color-muted)]">Due 28 Jun 2026</p>
                </div>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-status-sent)_14%,transparent)] px-2 py-0.5 text-xs font-medium text-[var(--color-status-sent)]">
                  Sent
                </span>
              </div>
              <div className="mb-4 space-y-2 text-sm">
                {[
                  { item: "Brand identity design", qty: 1, price: "₦350,000" },
                  { item: "Social media kit", qty: 1, price: "₦85,000" },
                  { item: "Website banner (5 variants)", qty: 5, price: "₦25,000" },
                ].map((row) => (
                  <div key={row.item} className="flex items-center justify-between rounded-[var(--radius-chip)] bg-[var(--color-surface)] px-3 py-2">
                    <span className="text-[var(--color-body)]">{row.item}</span>
                    <span className="font-ledger text-[var(--color-ink)]">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[var(--radius-chip)] bg-[var(--color-primary-soft)] p-3 text-right">
                <p className="text-xs text-[var(--color-muted)]">Total due</p>
                <p className="font-ledger text-xl font-bold text-[var(--color-primary)]">₦560,000</p>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 rounded-[var(--radius-chip)] border border-[var(--color-line)] py-2 text-center text-xs font-medium text-[var(--color-body)]">
                  Share link
                </div>
                <div className="flex-1 rounded-[var(--radius-chip)] bg-[var(--color-primary)] py-2 text-center text-xs font-medium text-white">
                  Pay ₦560,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Virtual account feature deep-dive ────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Mock virtual account card */}
            <div className="order-2 md:order-1 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                  <Building2 className="size-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Your Business Account</p>
                  <p className="text-xs text-[var(--color-muted)]">Powered by Paystack × Wema Bank</p>
                </div>
              </div>
              <div className="mb-6 rounded-[var(--radius-chip)] bg-[var(--color-surface-muted)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Account number</p>
                <p className="font-ledger text-2xl font-bold tracking-widest text-[var(--color-ink)]">0123 4567 89</p>
                <p className="mt-1 text-sm text-[var(--color-body)]">Wema Bank · ACME STORES LTD</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Received today", value: "₦1,240,000" },
                  { label: "This month", value: "₦8,900,000" },
                  { label: "Transactions", value: "47" },
                  { label: "Status", value: "Active ✓" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[var(--radius-chip)] bg-[var(--color-canvas)] p-3">
                    <p className="text-xs text-[var(--color-muted)]">{stat.label}</p>
                    <p className="font-ledger font-medium text-[var(--color-ink)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
                Virtual Accounts — Live now
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] md:text-4xl">
                A dedicated bank account for your business
              </h2>
              <p className="mt-4 text-[var(--color-body)]">
                Get a real Nigerian bank account number — powered by Paystack and Wema Bank — that your customers can transfer to directly. All settlements go straight to your nominated bank account.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Real account number, instant setup",
                  "Works with any Nigerian bank transfer",
                  "Automated settlement to your account",
                  "Linked to your invoice payments",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-[var(--color-body)]">
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--color-status-paid)]" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/register">
                    Get your account number
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[var(--color-surface)] py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] md:text-4xl">Up and running in minutes</h2>
            <p className="mt-3 text-[var(--color-body)]">No lengthy onboarding. No account manager calls. Just sign up and go.</p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-6 left-1/4 right-1/4 hidden h-px bg-[var(--color-line)] md:block" />
            {STEPS.map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)] font-display text-sm font-bold text-[var(--color-primary)]">
                  {step.step}
                </div>
                <h3 className="mb-2 font-display text-base font-semibold text-[var(--color-ink)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-body)]">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Create your free account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-line)] py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {TRUST_MARKS.map((mark) => (
              <div key={mark} className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <Shield className="size-3.5 text-[var(--color-status-paid)]" />
                {mark}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-[var(--color-ink)] md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-[var(--color-body)]">Start free. Pay a small platform fee only on successful invoice payments.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
            {[
              {
                name: "Free",
                price: "₦0/month",
                description: "For businesses just getting started.",
                features: [
                  "Unlimited invoices",
                  "1 virtual account",
                  "Email & WhatsApp delivery",
                  "₦150 platform fee per payment",
                  "Customer directory",
                  "Revenue analytics",
                ],
                cta: "Get started free",
                primary: false,
              },
              {
                name: "Pro",
                price: "Coming soon",
                description: "For growing businesses with more volume.",
                features: [
                  "Everything in Free",
                  "Payroll (up to 50 employees)",
                  "Business transfers",
                  "Bulk invoicing",
                  "Priority support",
                  "Custom invoice branding",
                ],
                cta: "Notify me",
                primary: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[var(--radius-card)] border p-6 ${plan.primary ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-line)] bg-[var(--color-surface)]"}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{plan.name}</h3>
                  {plan.primary && (
                    <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-medium text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="font-ledger text-2xl font-bold text-[var(--color-ink)]">{plan.price}</p>
                <p className="mb-5 mt-1 text-sm text-[var(--color-body)]">{plan.description}</p>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-body)]">
                      <CheckCircle2 className="size-4 shrink-0 text-[var(--color-status-paid)]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.primary ? "primary" : "secondary"} asChild>
                  <Link to="/register">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-primary)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Ready to take control of your business finances?
          </h2>
          <p className="mt-4 text-blue-100">
            Join thousands of African businesses using Synchgate. Free to start, no credit card needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-blue-50"
              asChild
            >
              <Link to="/register">
                Create your free account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="border-white bg-transparent text-white hover:bg-white/10"
              variant="secondary"
              asChild
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)] py-10">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Logo />
            <div className="flex gap-6 text-xs text-[var(--color-muted)]">
              <a href="#" className="hover:text-[var(--color-ink)]">Privacy</a>
              <a href="#" className="hover:text-[var(--color-ink)]">Terms</a>
              <a href="#" className="hover:text-[var(--color-ink)]">Contact</a>
              <a href="#" className="hover:text-[var(--color-ink)]">API Docs</a>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              © {new Date().getFullYear()} Entacrest · Synchgate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
