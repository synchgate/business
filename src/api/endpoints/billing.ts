import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type { MerchantSubscription, MerchantUsage, Plan } from "@/types/billing";

// Mirrors billing/urls.py exactly.
// Note: the billing module manages Synchgate's own platform fees charged to
// the merchant — this is distinct from the customer-facing invoicing module.

export async function listPlans() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<Plan[]>>("billing/plans/");
  return data.data;
}

export async function listSubscriptions() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<MerchantSubscription[]>>(
    "billing/subscriptions/",
  );
  return data.data;
}

export async function getMerchantUsage() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<MerchantUsage>>("billing/usage/");
  return data.data;
}
