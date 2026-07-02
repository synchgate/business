// Mirrors invoicing/models/invoice.py InvoicePayment + PaymentMethod exactly.

export type PaymentMethod =
  | "bank_transfer"
  | "virtual_account"
  | "cash"
  | "cheque"
  | "other";

// card and ussd are Paystack-only, excluded from manual recording
export const MANUAL_PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "virtual_account", label: "Virtual account" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export interface InvoicePayment {
  id: string;
  invoice: string;
  amount_paid: string;
  payment_method: PaymentMethod | "card" | "ussd";
  provider: string;
  reference: string;
  provider_reference: string | null;
  paid_at: string;
  is_manual: boolean;
  recorded_by: string | null;
  recorded_by_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RecordManualPaymentInput {
  amount_paid: number;
  payment_method: PaymentMethod;
  reference?: string;
  note?: string;
  paid_at?: string;
}
