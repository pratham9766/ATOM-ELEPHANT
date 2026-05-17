import { apiClient } from "@/lib/api-client";
import type { ApiGoal, ApiGoalSheet, GoalCreateRequest, GoalUpdateRequest, WeightageSummary } from "@/types/api";

export const goalsService = {
  getMySheet: () => apiClient.get<ApiGoalSheet>("/goals/sheets/me"),
  createSheet: () => apiClient.post<ApiGoalSheet>("/goals/sheets", {}),
  addGoal: (sheetId: string, body: GoalCreateRequest) => apiClient.post<ApiGoal>(`/goals/sheets/${sheetId}/goals`, body),
  updateGoal: (sheetId: string, goalId: string, body: GoalUpdateRequest) =>
    apiClient.patch<ApiGoal>(`/goals/sheets/${sheetId}/goals/${goalId}`, body),
  deleteGoal: (sheetId: string, goalId: string) => apiClient.delete<void>(`/goals/sheets/${sheetId}/goals/${goalId}`),
  submitSheet: (sheetId: string, version: number) =>
    apiClient.post<ApiGoalSheet>(`/goals/sheets/${sheetId}/submit`, { version }),
  weightage: (sheetId: string) => apiClient.get<WeightageSummary>(`/goals/sheets/${sheetId}/weightage`)
};
