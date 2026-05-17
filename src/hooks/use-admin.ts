"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin-service";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: adminService.auditLogs,
    retry: 1
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createCycle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] })
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cycleId, body }: { cycleId: string; body: Parameters<typeof adminService.updateCycle>[1] }) =>
      adminService.updateCycle(cycleId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] })
  });
}

export function useUnlockSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sheetId, reason }: { sheetId: string; reason: string }) => adminService.unlockSheet(sheetId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] })
  });
}

export function useForceSubmitSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.forceSubmit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] })
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
