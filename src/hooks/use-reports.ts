"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports-service";

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "completion-summary"],
    queryFn: reportsService.summary,
    retry: 1
  });
}
