import type {
  Activity,
  AlignmentNode,
  Approval,
  GoalRisk,
  RadarMetric,
  TrendPoint,
  WorkflowNode
} from "@/types/dashboard";

export const goalRisks: GoalRisk[] = [
  {
    id: "risk-1",
    employee: "Jane Doe",
    avatar: "JD",
    goal: "Enterprise OKR migration",
    progress: 72,
    risk: "High",
    recommendation: "Open manager escalation"
  },
  {
    id: "risk-2",
    employee: "Manager X",
    avatar: "MX",
    goal: "Sales enablement coverage",
    progress: 64,
    risk: "Medium",
    recommendation: "Schedule AI coaching"
  },
  {
    id: "risk-3",
    employee: "Priya Shah",
    avatar: "PS",
    goal: "Hiring plan completion",
    progress: 86,
    risk: "Low",
    recommendation: "Lock milestone"
  },
  {
    id: "risk-4",
    employee: "Noah Chen",
    avatar: "NC",
    goal: "Audit remediation SLA",
    progress: 58,
    risk: "High",
    recommendation: "Trigger compliance review"
  },
  {
    id: "risk-5",
    employee: "Avery Kim",
    avatar: "AK",
    goal: "Support quality uplift",
    progress: 79,
    risk: "Medium",
    recommendation: "Rebalance workload"
  }
];

export const radarMetrics: RadarMetric[] = [
  { metric: "Goal Alignment", value: 82 },
  { metric: "Employee Engagement", value: 74 },
  { metric: "Manager Feedback", value: 69 },
  { metric: "Audit Compliance", value: 88 },
  { metric: "Performance Stability", value: 77 }
];

export const workflowNodes: WorkflowNode[] = [
  { label: "Draft", owner: "Employee", state: "complete" },
  { label: "Submitted", owner: "Manager", state: "complete" },
  { label: "Approved", owner: "HR Ops", state: "active" },
  { label: "Locked", owner: "Audit", state: "locked" }
];

export const approvals: Approval[] = [
  { id: "ap-1", employee: "Malayer X", role: "Engineering Manager", avatar: "MX", sla: "4h SLA", status: "Ready" },
  { id: "ap-2", employee: "Jane DDE", role: "People Partner", avatar: "JD", sla: "8h SLA", status: "Pending" },
  { id: "ap-3", employee: "Employee A", role: "Revenue Ops", avatar: "EA", sla: "2h SLA", status: "Escalated" },
  { id: "ap-4", employee: "Sarah Lee", role: "Product Director", avatar: "SL", sla: "6h SLA", status: "Pending" }
];

export const activities: Activity[] = [
  {
    id: "act-1",
    title: "AI insight generated",
    detail: "Sales department risk model refreshed for Q1 goals.",
    time: "14 hours ago",
    tone: "info"
  },
  {
    id: "act-2",
    title: "Manager approved check-in",
    detail: "Chao-li progress review moved to locked state.",
    time: "14 hours ago",
    tone: "success"
  },
  {
    id: "act-3",
    title: "Escalation opened",
    detail: "Audit compliance SLA exceeded for employee cohort X.",
    time: "13 hours ago",
    tone: "warning"
  },
  {
    id: "act-4",
    title: "Goal alignment updated",
    detail: "Team item 3 linked to company ARR expansion goal.",
    time: "2 days ago",
    tone: "info"
  },
  {
    id: "act-5",
    title: "RBAC policy synced",
    detail: "Admin and Manager scopes synchronized with FastAPI gateway.",
    time: "3 days ago",
    tone: "success"
  }
];

export const trendData: TrendPoint[] = [
  { name: "Jan", completed: 32, forecast: 28 },
  { name: "Feb", completed: 62, forecast: 48 },
  { name: "Mar", completed: 51, forecast: 76 },
  { name: "Apr", completed: 88, forecast: 96 }
];

export const alignmentTree: AlignmentNode = {
  id: "company",
  label: "Company Goals",
  tone: "company",
  children: [
    {
      id: "expansion",
      label: "Expansion Goals",
      tone: "team",
      children: [
        { id: "team-1", label: "Team item 1", tone: "team" },
        { id: "team-2", label: "Team item 2", tone: "team" }
      ]
    },
    {
      id: "quality",
      label: "Operational Quality",
      tone: "team",
      children: [
        { id: "ind-1", label: "Individual Cost 1", tone: "individual" },
        { id: "ind-2", label: "Individual Cost 2", tone: "individual" }
      ]
    }
  ]
};
