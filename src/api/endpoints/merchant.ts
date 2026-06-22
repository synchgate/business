import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type {
  AccountVerifyInput,
  AccountVerifyResult,
  Merchant,
  MerchantUpdateInput,
  SettlementAccount,
  SubaccountSetupInput,
} from "@/types/auth";

// Mirrors merchants/urls.py exactly.

export async function updateMerchant(merchantId: string, input: MerchantUpdateInput) {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<Merchant>>(
    `merchants/merchant/${merchantId}/update/`,
    input,
  );
  return data.data;
}

export async function toggleMerchantMode(liveMode: boolean) {
  const { data } = await apiClient.patch<
    ApiSuccessEnvelope<{ status: string; message: string; live_mode: boolean }>
  >("merchants/switch/toggle-merchant-mode/", { live_mode: liveMode });
  return data.data;
}

export async function setupSettlementAccount(input: SubaccountSetupInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<SettlementAccount>>(
    "merchants/setup/subaccount/",
    input,
  );
  return data.data;
}

export async function verifyBankAccount(input: AccountVerifyInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<AccountVerifyResult>>(
    "merchants/setup/verify-account/",
    input,
  );
  return data.data;
}

export async function getSettlementAccount() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<SettlementAccount>>(
    "merchants/setup/account/",
  );
  return data.data;
}
