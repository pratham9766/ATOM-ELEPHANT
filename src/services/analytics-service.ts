import { apiClient } from "@/lib/api-client";
import type { OrgAnalytics } from "@/types/api";

export const analyticsService = {
  orgSummary: () => apiClient.get<OrgAnalytics>("/analytics/org-summary")
};
