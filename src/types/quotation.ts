// Mirrors invoicing/models.py QuotationStatus + QuotationSerializer field sets.
// Keep in lockstep with the backend — not guessed shapes.

export type QuotationStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "cancelled";

export interface QuotationItem {
  id: string;
  item_name: string;
  description: string | null;
  quantity: string;
  unit_price: string;
  amount: string;
}

export interface QuotationActivity {
  id: string;
  activity: string;
  note: string | null;
  performed_by: "merchant" | "customer" | "system";
  created_at: string;
}

export interface QuotationListEntry {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  issue_date: string;
  expiry_date: string;
  total_amount: string;
  currency: string;
  status: QuotationStatus;
  created_at: string;
}

export interface QuotationDetail extends QuotationListEntry {
  customer_phone: string | null;
  subtotal: string;
  discount: string;
  tax: string;
  notes: string | null;
  terms: string | null;
  customer_note: string | null;
  converted_invoice: string | null;        // UUID of Invoice
  converted_invoice_number: string | null; // e.g. INV-2026-000001
  items: QuotationItem[];
  activity_log: QuotationActivity[];
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  converted_at: string | null;
  updated_at: string;
}

export interface QuotationItemInput {
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface QuotationCreateInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer?: string; // customer directory UUID
  issue_date?: string;
  expiry_date: string;
  currency: string;
  discount?: number;
  tax?: number;
  notes?: string;
  terms?: string;
  items: QuotationItemInput[];
}

export interface QuotationConvertInput {
  due_date?: string;
  notes?: string;
  terms?: string;
  items?: QuotationItemInput[];
}

export interface QuotationListFilters {
  status?: QuotationStatus;
  customer_email?: string;
  page?: number;
}
