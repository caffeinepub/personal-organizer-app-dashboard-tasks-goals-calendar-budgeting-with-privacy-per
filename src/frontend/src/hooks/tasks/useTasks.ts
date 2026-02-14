import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { Task, TaskType } from '@/backend';

export function useGetTasks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTasks(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      description,
      dueDate,
      taskType,
    }: {
      description: string;
      dueDate: bigint | null;
      taskType: TaskType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(description, dueDate, taskType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      description,
      dueDate,
      taskType,
    }: {
      id: bigint;
      description: string;
      dueDate: bigint | null;
      taskType: TaskType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(id, description, dueDate, taskType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useToggleTaskCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleTaskCompletion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}
