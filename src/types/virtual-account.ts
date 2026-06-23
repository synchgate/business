// Mirrors merchants/serializers/virtual_account.py exactly.

export interface VirtualAccount {
  id: string;
  dedicated_account_id: number;
  dedicated_account_number: string;
  account_name: string;
  bank_name: string;
  customer_code: string | null;
  active: boolean;
  created_at: string;
}
