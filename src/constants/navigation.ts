import {
  Activity,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  Gauge,
  Goal,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";
import type { NavItem } from "@/types/dashboard";

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Gauge, section: "primary" },
  { label: "Goals", href: "/goals", icon: Goal, section: "primary" },
  { label: "Team Performance", href: "/team", icon: Users, section: "primary" },
  { label: "Check-ins", href: "/check-ins", icon: ClipboardCheck, section: "primary" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, section: "primary" },
  { label: "Reports", href: "/reports", icon: FileText, section: "primary" },
  { label: "Notifications", href: "/notifications", icon: Bell, section: "system" },
  { label: "Audit Logs", href: "/audit", icon: ShieldCheck, section: "system" },
  { label: "Settings", href: "/settings", icon: Settings, section: "system" }
];

export const productCycles = ["Q1 2026 Cycle", "Q2 2026 Planning", "FY 2026 Executive"];
export const roles = ["Admin", "Manager", "Employee"] as const;
export const liveSignals = [
  { label: "Escalation latency", value: "2.4h", tone: "text-cyan-200" },
  { label: "RBAC coverage", value: "99.2%", tone: "text-emerald-200" },
  { label: "Audit drift", value: "0.8%", tone: "text-amber-200" }
];
