import {
  activities,
  alignmentTree,
  approvals,
  goalRisks,
  radarMetrics,
  trendData,
  workflowNodes
} from "@/constants/mock-data";
import { adminService } from "@/services/admin-service";
import { analyticsService } from "@/services/analytics-service";
import { managerService } from "@/services/manager-service";
import { goalRiskScore } from "@/features/insights/insight-engine";
import { relativeTime } from "@/lib/time";
import type { Activity, GoalRisk } from "@/types/dashboard";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardSnapshot = {
  orgCompletion: 78,
  aiConfidence: 92,
  goalRisks,
  radarMetrics,
  workflowNodes,
  approvals,
  activities,
  trendData,
  alignmentTree
};

export const dashboardService = {
  async getDashboard() {
    try {
      const [analytics, auditLogs, submissions] = await Promise.all([
        analyticsService.orgSummary(),
        adminService.auditLogs().catch(() => []),
        managerService.teamSubmissions().catch(() => [])
      ]);

      const apiGoalRisks: GoalRisk[] = submissions
        .flatMap((sheet) =>
          sheet.goals.map((goal) => ({
            id: goal.id,
            employee: sheet.user?.name ?? "Employee",
            avatar: (sheet.user?.name ?? "EM")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2),
            goal: goal.title,
            progress: Math.min(100, Math.max(5, Number(goal.weightage) * 1.6)),
            risk: goalRiskScore(goal),
            recommendation: Number(goal.weightage) > 45 ? "Rebalance weightage" : "Monitor trajectory"
          }))
        )
        .slice(0, 5);

      const apiActivities: Activity[] = auditLogs.slice(0, 8).map((log) => ({
        id: log.id,
        title: log.action.replaceAll("_", " "),
        detail: `${log.entity_type} ${log.entity_id.slice(0, 8)} updated through workflow event.`,
        time: relativeTime(log.timestamp),
        tone: log.action.includes("APPROVE") || log.action.includes("LOCK") ? "success" : "info"
      }));

      return {
        ...dashboardSnapshot,
        orgCompletion: Math.round(analytics.completion_rate || dashboardSnapshot.orgCompletion),
        goalRisks: apiGoalRisks.length ? apiGoalRisks : dashboardSnapshot.goalRisks,
        activities: apiActivities.length ? apiActivities : dashboardSnapshot.activities
      };
    } catch {
      await wait(220);
      return dashboardSnapshot;
    }
  }
};
