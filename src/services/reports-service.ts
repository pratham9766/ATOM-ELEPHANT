import { apiClient } from "@/lib/api-client";
import type { ReportSummary } from "@/types/api";

export const reportsService = {
  summary: () => apiClient.get<ReportSummary>("/reports/completion-summary"),
  achievementCsv: () => apiClient.get<string>("/reports/achievement.csv")
};
