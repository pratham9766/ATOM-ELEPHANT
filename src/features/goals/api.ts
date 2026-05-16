import type { GoalRisk } from "@/types/dashboard";

export interface GoalsListParams {
  page?: number;
  pageSize?: number;
  risk?: GoalRisk["risk"];
}

export async function listGoals(params: GoalsListParams = {}) {
  return {
    params,
    endpoint: "/api/v1/goals",
    auth: "Bearer <jwt>",
    pagination: { page: params.page ?? 1, pageSize: params.pageSize ?? 25 }
  };
}
