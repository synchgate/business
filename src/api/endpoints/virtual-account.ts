import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type { VirtualAccount } from "@/types/virtual-account";

// Mirrors merchants/urls.py virtual account routes exactly.

export async function createVirtualAccount() {
  const { data } = await apiClient.post<ApiSuccessEnvelope<VirtualAccount>>(
    "merchants/setup/virtual-account/",
  );
  return data.data;
}

export async function getVirtualAccount() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<VirtualAccount>>(
    "merchants/virtual-account/",
  );
  return data.data;
}

export async function refreshVirtualAccount() {
  const { data } = await apiClient.post<ApiSuccessEnvelope<VirtualAccount>>(
    // VirtualAccountRefreshView — not yet in merchants/urls.py but service exists
    "merchants/virtual-account/refresh/",
  );
  return data.data;
}
