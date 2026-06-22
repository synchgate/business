import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getSettlementAccount } from "@/api/endpoints/merchant";

/**
 * SubaccountProfileView (merchants/setup/account/) 404s with
 * "No settlement account configured." when nothing's set up yet — that's an
 * expected state here, not an error, so it's normalized to `null` instead of
 * surfacing through React Query's error channel.
 */
export function useSettlementAccount() {
  const query = useQuery({
    queryKey: ["merchant", "settlementAccount"],
    queryFn: async () => {
      try {
        return await getSettlementAccount();
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  return {
    settlementAccount: query.data ?? null,
    isConfigured: !!query.data,
    isLoading: query.isLoading,
  };
}
