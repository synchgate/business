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

export async function getVirtualAccount(): Promise<VirtualAccount | null> {
  const { data } = await apiClient.get("merchants/virtual-account/");

  // Backend returns:
  // {
  //   "status": "error",
  //   "message": "No virtual account configured.",
  //   "errors": 404
  // }
  if (
    data?.status === "error" &&
    data?.message === "No virtual account configured."
  ) {
    return null;
  }

  return (data as ApiSuccessEnvelope<VirtualAccount>).data;
}

export async function refreshVirtualAccount() {
  const { data } = await apiClient.post<ApiSuccessEnvelope<VirtualAccount>>(
    "merchants/virtual-account/refresh/",
  );

  return data.data;
}