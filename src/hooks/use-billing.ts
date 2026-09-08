import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentSubscription,
  getMerchantUsage,
  listPlans,
  listSubscriptions,
  subscribeToPlan,
} from "@/api/endpoints/billing";

export function usePlans() {
  return useQuery({ queryKey: ["billing", "plans"], queryFn: listPlans });
}

export function useSubscriptions() {
  return useQuery({ queryKey: ["billing", "subscriptions"], queryFn: listSubscriptions });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["billing", "subscriptions", "current"],
    queryFn: getCurrentSubscription,
    retry: false,
  });
}

export function useMerchantUsage() {
  return useQuery({
    queryKey: ["billing", "usage"],
    queryFn: getMerchantUsage,
    staleTime: 60_000,
  });
}

export function useSubscribeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, callbackUrl }: { planId: string; callbackUrl: string }) =>
      subscribeToPlan(planId, callbackUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "subscriptions"] });
    },
  });
}
