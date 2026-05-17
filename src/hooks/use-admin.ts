"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin-service";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: adminService.auditLogs,
    retry: 1
  });
}

export function useEscalations() {
  return useQuery({
    queryKey: ["admin", "escalations"],
    queryFn: async () => {
      const [rules, events] = await Promise.all([adminService.escalationRules(), adminService.escalationEvents()]);
      return { rules, events };
    },
    retry: 1
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [cycles, users, rules, events] = await Promise.all([
        adminService.cycles(),
        adminService.users(),
        adminService.escalationRules(),
        adminService.escalationEvents()
      ]);
      return { cycles, users, rules, events };
    },
    retry: 1
  });
}
