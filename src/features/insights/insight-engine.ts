import type { ApiGoal, ApiGoalSheet, OrgAnalytics } from "@/types/api";
import type { RiskLevel } from "@/types/dashboard";

export type InsightSeverity = "info" | "warning" | "critical" | "success";

export interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: InsightSeverity;
}

export function generateGoalInsights(sheet?: ApiGoalSheet | null): Insight[] {
  if (!sheet) {
    return [];
  }
  const goals = sheet.goals;
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage), 0);
  const thrustCounts = goals.reduce<Record<string, number>>((acc, goal) => {
    acc[goal.thrust_area] = (acc[goal.thrust_area] ?? 0) + 1;
    return acc;
  }, {});
  const largestThrustShare = goals.length ? Math.max(...Object.values(thrustCounts)) / goals.length : 0;
  const largestWeight = goals.length ? Math.max(...goals.map((goal) => Number(goal.weightage))) : 0;

  return [
    total !== 100
      ? {
          id: "weightage",
          title: "Allocation requires attention",
          detail: `Goal allocation currently totals ${total}%. ${total < 100 ? `Add ${100 - total}%` : `Reduce ${total - 100}%`} before submission.`,
          severity: "warning"
        }
      : {
          id: "weightage-ready",
          title: "Allocation is submission-ready",
          detail: "Goal weightage totals exactly 100% and passes enterprise validation.",
          severity: "success"
        },
    largestWeight > 45
      ? {
          id: "concentration",
          title: "Goal distribution appears imbalanced",
          detail: "One goal carries more than 45% weightage. Consider splitting risk across milestones.",
          severity: "warning"
        }
      : {
          id: "balanced",
          title: "Goal distribution is balanced",
          detail: "No individual goal dominates the performance plan.",
          severity: "info"
        },
    largestThrustShare >= 0.7
      ? {
          id: "thrust-area",
          title: "Thrust area concentration detected",
          detail: "70% or more of goals are concentrated in one thrust area.",
          severity: "critical"
        }
      : {
          id: "thrust-area-balanced",
          title: "Thrust areas are diversified",
          detail: "The goal sheet shows healthy distribution across operating priorities.",
          severity: "success"
        }
  ];
}

export function generateExecutiveInsights(analytics?: OrgAnalytics | null): Insight[] {
  if (!analytics) {
    return [];
  }
  return [
    {
      id: "completion",
      title: `${analytics.completion_rate}% organization completion`,
      detail:
        analytics.completion_rate >= 80
          ? "Completion is above enterprise operating target."
          : "Completion is below target; intervention list should be reviewed.",
      severity: analytics.completion_rate >= 80 ? "success" : "warning"
    },
    {
      id: "locked",
      title: `${analytics.locked_sheets} approved plans locked`,
      detail: "Locked plans are audit-safe and ready for quarterly check-ins.",
      severity: "info"
    }
  ];
}

export function goalRiskScore(goal: ApiGoal): RiskLevel {
  const weight = Number(goal.weightage);
  if (weight >= 45) return "High";
  if (weight >= 30) return "Medium";
  return "Low";
}
