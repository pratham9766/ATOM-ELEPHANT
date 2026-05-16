import {
  activities,
  alignmentTree,
  approvals,
  goalRisks,
  radarMetrics,
  trendData,
  workflowNodes
} from "@/constants/mock-data";

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
    await wait(220);
    return dashboardSnapshot;
  }
};
