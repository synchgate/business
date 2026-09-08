import { isAxiosError } from "axios";
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

export async function getCurrentSubscription() {
  try {
    const { data } = await apiClient.get<ApiSuccessEnvelope<MerchantSubscription>>(
      "billing/subscriptions/current/",
    );
    return data.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export interface SubscribeResult {
  payment_url: string;
  reference: string;
}

// Billed directly to EBS's own Paystack account — intentionally not the
// Synchgate PSP-orchestration subscription endpoint (billing/subscriptions/),
// which routes payments through a merchant's own payment infrastructure.
export async function subscribeToPlan(planId: string, callbackUrl: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<SubscribeResult>>(
    "billing/subscribe/",
    { plan_id: planId, callback_url: callbackUrl },
  );
  return data.data;
}
