import { apiClient } from "@/lib/api-client";
import type { ApiApprovalSheet, ApiGoal, ApiGoalSheet, GoalUpdateRequest } from "@/types/api";

export const managerService = {
  teamSubmissions: () => apiClient.get<ApiApprovalSheet[]>("/manager/team-submissions"),
  approve: (sheetId: string) => apiClient.post<ApiGoalSheet>(`/manager/goal-sheets/${sheetId}/approve`),
  returnForRework: (sheetId: string, comment: string) =>
    apiClient.post<ApiGoalSheet>(`/manager/goal-sheets/${sheetId}/return`, { comment }),
  inlineEditGoal: (sheetId: string, goalId: string, body: GoalUpdateRequest) =>
    apiClient.patch<ApiGoal>(`/manager/goal-sheets/${sheetId}/goals/${goalId}`, body)
};
