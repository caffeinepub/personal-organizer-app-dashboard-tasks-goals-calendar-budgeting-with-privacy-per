import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { TaskType, Recurrence } from '@/backend';

interface CreateSyncedTaskParams {
  description: string;
  dueDate: bigint;
  taskType: TaskType;
  recurrence?: Recurrence | null;
}

interface UpdateSyncedTaskParams {
  taskId: bigint;
  description: string;
  dueDate: bigint | null;
  taskType: TaskType;
}

interface CreateSyncedCalendarTaskParams {
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint | null;
  recurrence: Recurrence | null;
}

interface UpdateSyncedCalendarEntryParams {
  entryId: bigint;
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint | null;
  recurrence: Recurrence | null;
  isTask: boolean;
}

export function useCreateSyncedTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ description, dueDate, taskType, recurrence }: CreateSyncedTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(description, dueDate, taskType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useUpdateSyncedTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, description, dueDate, taskType }: UpdateSyncedTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(taskId, description, dueDate, taskType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useDeleteSyncedTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useCreateSyncedCalendarTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, startTime, endTime, recurrence }: CreateSyncedCalendarTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      const taskId = BigInt(Date.now() % 1000000);
      return actor.createCalendarEntry(title, description, startTime, endTime, recurrence, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useUpdateSyncedCalendarEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, title, description, startTime, endTime, recurrence, isTask }: UpdateSyncedCalendarEntryParams) => {
      if (!actor) throw new Error('Actor not available');
      const taskId = isTask ? entryId : null;
      return actor.updateCalendarEntry(entryId, title, description, startTime, endTime, recurrence, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}

export function useDeleteSyncedCalendarEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCalendarEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEntries'] });
    },
  });
}
