import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { CryptoEntry } from '@/backend';

export function useGetCryptoPortfolio() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CryptoEntry[]>({
    queryKey: ['cryptoPortfolio'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getCryptoPortfolio(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateCryptoEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      symbol: string;
      amount: bigint;
      purchasePriceCents: bigint;
      currentPriceCents: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCryptoEntry(
        params.symbol,
        params.amount,
        params.purchasePriceCents,
        params.currentPriceCents
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoPortfolio'] });
    },
  });
}

export function useUpdateCryptoEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      amount: bigint;
      purchasePriceCents: bigint;
      currentPriceCents: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCryptoEntry(
        params.id,
        params.amount,
        params.purchasePriceCents,
        params.currentPriceCents
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoPortfolio'] });
    },
  });
}

export function useDeleteCryptoEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCryptoEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoPortfolio'] });
    },
  });
}
