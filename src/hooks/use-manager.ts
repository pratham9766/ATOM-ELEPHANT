"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/services/manager-service";

export function useTeamSubmissions() {
  return useQuery({
    queryKey: ["manager", "team-submissions"],
    queryFn: managerService.teamSubmissions,
    retry: 1
  });
}

export function useTeamCheckins() {
  return useQuery({
    queryKey: ["manager", "team-checkins"],
    queryFn: managerService.teamCheckins,
    retry: 1
  });
}

export function useApproveSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: managerService.approve,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manager"] })
  });
}

export function useInlineEditGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sheetId,
      goalId,
      body
    }: {
      sheetId: string;
      goalId: string;
      body: Parameters<typeof managerService.inlineEditGoal>[2];
    }) => managerService.inlineEditGoal(sheetId, goalId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manager"] })
  });
}

export function useCreateSharedGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: managerService.createSharedGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manager"] })
  });
}

export function useReturnSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sheetId, comment }: { sheetId: string; comment: string }) =>
      managerService.returnForRework(sheetId, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manager"] })
  });
}
