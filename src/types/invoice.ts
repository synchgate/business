// Mirrors invoicing/models/invoice.py InvoiceStatus and the serializer field
// sets in invoicing/serializers/invoice.py. Keep this file in lockstep with
// the backend — these are not guessed shapes, they're read off the DRF code.

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

// InvoicePayment.payment_method choices weren't pinned down from the model,
// so this stays a plain string rather than a guessed union — it's only
// surfaced as display text (in receipts), never used to drive branching UI.
export type PaymentMethod = string;

export interface InvoiceItem {
  id: string;
  item_name: string;
  description: string | null;
  quantity: string;
  unit_price: string;
  amount: string;
}

export interface InvoiceListEntry {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  issue_date: string;
  due_date: string;
  total_amount: string;
  amount_paid: string;
  currency: string;
  status: InvoiceStatus;
  payment_link: string | null;
  created_at: string;
}

export interface InvoiceDetail extends InvoiceListEntry {
  customer_phone: string | null;
  subtotal: string;
  discount: string;
  tax: string;
  receipt_url: string | null;
  notes: string | null;
  terms: string | null;
  platform_fee: string;
  items: InvoiceItem[];
  sent_at: string | null;
  paid_at: string | null;
  updated_at: string;
}

export interface InvoiceItemInput {
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceCreateInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  issue_date?: string;
  due_date: string;
  currency: string;
  discount?: number;
  tax?: number;
  notes?: string;
  terms?: string;
  items: InvoiceItemInput[];
}

export interface InvoiceListFilters {
  status?: InvoiceStatus;
  customer_email?: string;
  page?: number;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  invoice_number: string;
  customer_name: string;
  merchant_name: string;
  amount: string;
  payment_date: string;
  receipt_pdf: string | null;
  created_at: string;
}

export interface InvoiceAnalytics {
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  outstanding_invoices: number;
  total_revenue_collected: string;
  total_outstanding_amount: string;
  collection_rate: number;
  average_payment_duration_days: number | null;
  monthly_collections: { month: string; total: number; count: number }[];
}
