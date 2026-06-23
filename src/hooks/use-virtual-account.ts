import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createVirtualAccount, getVirtualAccount } from "@/api/endpoints/virtual-account";

export function useVirtualAccount() {
  const query = useQuery({
    queryKey: ["merchant", "virtualAccount"],
    queryFn: async () => {
      try {
        return await getVirtualAccount();
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 120_000,
  });

  return {
    virtualAccount: query.data ?? null,
    isConfigured: !!query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCreateVirtualAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", "virtualAccount"] });
    },
  });
}
