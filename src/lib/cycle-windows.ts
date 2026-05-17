import type { ApiCycle, Quarter } from "@/types/api";

export function isGoalWindowOpen(cycle?: ApiCycle | null, now = new Date()) {
  if (!cycle) return false;
  return new Date(cycle.goal_window_open) <= now && now <= new Date(cycle.goal_window_close);
}

export function activeQuarter(cycle?: ApiCycle | null, now = new Date()): Quarter | null {
  if (!cycle) return null;
  if (now >= new Date(cycle.q4_open)) return "Q4";
  if (now >= new Date(cycle.q3_open)) return "Q3";
  if (now >= new Date(cycle.q2_open)) return "Q2";
  if (now >= new Date(cycle.q1_open)) return "Q1";
  return null;
}

export function quarterIsOpen(cycle: ApiCycle | null | undefined, quarter: Quarter) {
  return activeQuarter(cycle) === quarter;
}
