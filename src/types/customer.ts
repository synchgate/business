// Mirrors invoicing/serializers/customer.py exactly.

export type CustomerType = "individual" | "business";

export interface CustomerListEntry {
  id: string;
  customer_type: CustomerType;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CustomerDetail extends CustomerListEntry {
  address_line: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  notes: string | null;
  invoice_count: number;
  total_invoiced: string;
  total_paid: string;
  outstanding_balance: string;
  updated_at: string;
}

export interface CustomerCreateInput {
  customer_type: CustomerType;
  name: string;
  business_name?: string;
  email: string;
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
}

export interface CustomerListFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
}
