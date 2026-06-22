// Mirrors billing/serializers/ exactly.

export interface Plan {
  id: string;
  name: string;
  tier: "free" | "starter" | "growth" | "pro" | "enterprise";
  price: string;
  transaction_limit: number;
  fee_per_transaction: string;
}

export interface MerchantSubscription {
  id: string;
  merchant: string;
  plan: Plan;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export interface MerchantUsage {
  pending_fee_count: number;
  pending_fee_total: string;
  invoiced_fee_count: number;
  invoiced_fee_total: string;
  current_balance: string;
  credit_limit: string;
  available_credit: string;
  account_status: string;
  plan: string;
  fee_per_transaction: string;
}
