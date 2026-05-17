import { apiClient } from "@/lib/api-client";
import type { ApiAuditLog, ApiCycle, ApiUser, EscalationEvent, EscalationRule } from "@/types/api";

export const adminService = {
  auditLogs: () => apiClient.get<ApiAuditLog[]>("/admin/audit-logs"),
  cycles: () => apiClient.get<ApiCycle[]>("/admin/cycles"),
  users: () => apiClient.get<ApiUser[]>("/admin/users"),
  escalationRules: () => apiClient.get<EscalationRule[]>("/admin/escalation-rules"),
  escalationEvents: () => apiClient.get<EscalationEvent[]>("/admin/escalation-events"),
  activateCycle: (cycleId: string) => apiClient.post<ApiCycle>(`/admin/cycles/${cycleId}/activate`),
  unlockSheet: (sheetId: string, reason: string) =>
    apiClient.post<{ message: string; sheet_id: string }>(`/admin/goal-sheets/${sheetId}/unlock`, { reason })
};
