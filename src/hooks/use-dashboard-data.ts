"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService, dashboardSnapshot } from "@/services/dashboard-service";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard", "executive-intelligence"],
    queryFn: dashboardService.getDashboard,
    initialData: dashboardSnapshot
  });
}
