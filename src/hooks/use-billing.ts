import { useQuery } from "@tanstack/react-query";
import { getMerchantUsage, listPlans, listSubscriptions } from "@/api/endpoints/billing";

export function usePlans() {
  return useQuery({ queryKey: ["billing", "plans"], queryFn: listPlans });
}

export function useSubscriptions() {
  return useQuery({ queryKey: ["billing", "subscriptions"], queryFn: listSubscriptions });
}

export function useMerchantUsage() {
  return useQuery({
    queryKey: ["billing", "usage"],
    queryFn: getMerchantUsage,
    staleTime: 60_000,
  });
}
