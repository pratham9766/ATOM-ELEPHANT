import type { LucideIcon } from "lucide-react";

export type UserRole = "Admin" | "Manager" | "Employee";
export type RiskLevel = "Low" | "Medium" | "High";
export type ApprovalStatus = "Pending" | "Escalated" | "Ready";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: "primary" | "system";
}

export interface GoalRisk {
  id: string;
  employee: string;
  avatar: string;
  goal: string;
  progress: number;
  risk: RiskLevel;
  recommendation: string;
}

export interface Approval {
  id: string;
  employee: string;
  role: string;
  avatar: string;
  sla: string;
  status: ApprovalStatus;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "info" | "success" | "warning";
}

export interface TrendPoint {
  name: string;
  completed: number;
  forecast: number;
}

export interface RadarMetric {
  metric: string;
  value: number;
}

export interface WorkflowNode {
  label: string;
  owner: string;
  state: "complete" | "active" | "locked";
}

export interface AlignmentNode {
  id: string;
  label: string;
  tone: "company" | "team" | "individual";
  children?: AlignmentNode[];
}
