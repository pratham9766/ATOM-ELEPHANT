import { apiClient } from "@/lib/api-client";
import type { ApiAuditLog, EscalationEvent, EscalationRule } from "@/types/api";

export const adminService = {
  auditLogs: () => apiClient.get<ApiAuditLog[]>("/admin/audit-logs"),
  escalationRules: () => apiClient.get<EscalationRule[]>("/admin/escalation-rules"),
  escalationEvents: () => apiClient.get<EscalationEvent[]>("/admin/escalation-events"),
  unlockSheet: (sheetId: string, reason: string) =>
    apiClient.post<{ message: string; sheet_id: string }>(`/admin/goal-sheets/${sheetId}/unlock`, { reason })
};
