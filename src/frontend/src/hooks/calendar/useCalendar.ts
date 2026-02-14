import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { CalendarEntry } from '@/backend';

export function useGetCalendarEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CalendarEntry[]>({
    queryKey: ['calendarEntries'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getCalendarEntries(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateCalendarEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      startTime,
      endTime,
    }: {
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCalendarEntry(title, description, startTime, endTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useUpdateCalendarEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      startTime,
      endTime,
    }: {
      id: bigint;
      title: string;
      description: string;
      startTime: bigint;
      endTime: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCalendarEntry(id, title, description, startTime, endTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useDeleteCalendarEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCalendarEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}
