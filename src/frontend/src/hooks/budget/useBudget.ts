import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { BudgetItem, BudgetItemType } from '@/backend';

export function useGetBudgetItems() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<BudgetItem[]>({
    queryKey: ['budgetItems'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getBudgetItems(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateBudgetItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      date,
      itemType,
    }: {
      amount: bigint;
      description: string;
      date: bigint;
      itemType: BudgetItemType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBudgetItem(amount, description, date, itemType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
    },
  });
}

export function useUpdateBudgetItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      description,
      date,
      itemType,
    }: {
      id: bigint;
      amount: bigint;
      description: string;
      date: bigint;
      itemType: BudgetItemType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBudgetItem(id, amount, description, date, itemType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
    },
  });
}

export function useDeleteBudgetItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBudgetItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
    },
  });
}
