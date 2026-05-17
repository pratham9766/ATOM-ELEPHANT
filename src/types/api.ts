export type ApiRole = "employee" | "manager" | "admin";
export type SheetStatus = "draft" | "submitted" | "rework" | "approved" | "locked";
export type GoalStatus = "draft" | "active" | "locked" | "archived";
export type UomType = "numeric_min" | "numeric_max" | "timeline" | "zero";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type CheckinStatus = "not_started" | "on_track" | "completed" | "reviewed";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
  manager_id: string | null;
  department: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DemoLoginRequest {
  role: ApiRole;
}

export interface ApiGoal {
  id: string;
  goal_sheet_id: string;
  title: string;
  description: string | null;
  thrust_area: string;
  uom_type: UomType;
  target: string | null;
  target_date: string | null;
  weightage: string;
  is_shared: boolean;
  shared_goal_key?: string | null;
  status: GoalStatus;
  position: number;
  version: number;
  checkins?: ApiCheckin[];
  created_at: string;
  updated_at: string;
}

export interface ApiGoalSheet {
  id: string;
  user_id: string;
  cycle_id: string;
  status: SheetStatus;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  locked_at: string | null;
  rework_comment: string | null;
  version: number;
  goals: ApiGoal[];
  user?: ApiUser | null;
  cycle?: ApiCycle | null;
  created_at: string;
  updated_at: string;
}

export interface GoalCreateRequest {
  title: string;
  description?: string | null;
  thrust_area: string;
  uom_type: UomType;
  target?: number | string | null;
  target_date?: string | null;
  weightage: number | string;
  is_shared?: boolean;
}

export interface GoalUpdateRequest extends Partial<GoalCreateRequest> {
  version: number;
}

export interface WeightageSummary {
  total: string;
  remaining: string;
  goal_count: number;
  is_valid: boolean;
  message: string;
}

export interface ApiApprovalSheet extends ApiGoalSheet {
  user?: ApiUser;
}

export interface ApiAuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_by: string | null;
  timestamp: string;
}

export interface CheckinUpsertRequest {
  goal_id: string;
  quarter: Quarter;
  planned_value?: number | string | null;
  actual_value?: number | string | null;
  actual_date?: string | null;
  status: CheckinStatus;
}

export interface ApiCheckin {
  id: string;
  goal_id: string;
  quarter: Quarter;
  planned_value: string | null;
  actual_value: string | null;
  actual_date: string | null;
  progress_score: string | null;
  status: CheckinStatus;
  updated_at: string;
  comments?: ApiManagerComment[];
}

export interface ApiManagerComment {
  id: string;
  checkin_id: string;
  manager_id: string;
  comment: string;
  created_at: string;
}

export interface EscalationRule {
  id: string;
  cycle_id: string;
  trigger_type: "not_submitted" | "not_approved" | "checkin_missing";
  threshold_days: number;
  notify_level: "employee" | "manager" | "hr";
  is_active: boolean;
}

export interface EscalationEvent {
  id: string;
  rule_id: string;
  target_user_id: string;
  fired_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  status: "open" | "resolved";
}

export interface ApiCycle {
  id: string;
  name: string;
  goal_window_open: string;
  goal_window_close: string;
  q1_open: string;
  q2_open: string;
  q3_open: string;
  q4_open: string;
  is_active: boolean;
}

export interface CycleCreateRequest {
  name: string;
  goal_window_open: string;
  goal_window_close: string;
  q1_open: string;
  q2_open: string;
  q3_open: string;
  q4_open: string;
  is_active?: boolean;
}

export interface CycleUpdateRequest extends Partial<CycleCreateRequest> {}

export interface ReportSummary {
  goal_sheets: number;
  goals: number;
  checkins: number;
  checkin_completion_rate: number;
}

export interface OrgAnalytics {
  completion_rate: number;
  submitted_sheets: number;
  approved_sheets: number;
  locked_sheets: number;
  metrics: Array<{ label: string; value: string | number; delta?: string | null }>;
  departments: Array<{ department: string; completion_rate: number; submitted: number; locked: number; total: number }>;
  thrust_areas: Array<{ thrust_area: string; weightage: number; goals: number }>;
  manager_effectiveness: Array<{
    manager: string;
    direct_reports: number;
    submitted_sheets: number;
    locked_sheets: number;
    effectiveness_rate: number;
  }>;
}

export interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string;
}
