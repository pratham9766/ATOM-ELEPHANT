"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalsService } from "@/services/goals-service";
import type { GoalCreateRequest, GoalUpdateRequest } from "@/types/api";

export function useMyGoalSheet() {
  return useQuery({
    queryKey: ["goals", "my-sheet"],
    queryFn: goalsService.getMySheet,
    retry: 1
  });
}

export function useAddGoal(sheetId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalCreateRequest) => goalsService.addGoal(sheetId!, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] })
  });
}

export function useUpdateGoal(sheetId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, body }: { goalId: string; body: GoalUpdateRequest }) =>
      goalsService.updateGoal(sheetId!, goalId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] })
  });
}

export function useSubmitGoalSheet(sheetId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => goalsService.submitSheet(sheetId!, version),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] })
  });
}
