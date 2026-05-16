"use client";

import { motion } from "framer-motion";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { GoalAlignmentTree } from "@/components/dashboard/goal-alignment-tree";
import { OrgHealthCard } from "@/components/dashboard/org-health-card";
import { OrgPerformanceCard } from "@/components/dashboard/org-performance-card";
import { PendingApprovalsPanel } from "@/components/dashboard/pending-approvals-panel";
import { WorkflowVisualization } from "@/components/dashboard/workflow-visualization";
import { GoalRiskTable } from "@/components/tables/goal-risk-table";
import { FadeIn } from "@/components/animations/fade-in";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { MetricPill } from "@/components/shared/metric-pill";
import { liveSignals } from "@/constants/navigation";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function DashboardShell() {
  const { data, isLoading } = useDashboardData();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen overflow-hidden">
      <Sidebar />
      <motion.main
        className={cn("h-screen overflow-y-auto transition-[padding] duration-300 lg:pl-[304px]", sidebarCollapsed && "lg:pl-[92px]")}
      >
        <TopNavbar />
        <div className="mx-auto max-w-[1880px] px-4 pb-6 pt-4 lg:px-6">
          <FadeIn className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Enterprise Performance Command Center</h1>
              <p className="mt-1 text-sm text-slate-400">AI-augmented goals, approvals, risks, and operating intelligence.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {liveSignals.map((signal) => (
                <MetricPill key={signal.label} {...signal} />
              ))}
            </div>
          </FadeIn>

          {isLoading || !data ? (
            <div className="grid h-[70vh] place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300">
              Loading ELEPHANT intelligence layer...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-8 2xl:grid-cols-12">
              <FadeIn className="xl:col-span-3 2xl:col-span-4" delay={0.02}>
                <OrgPerformanceCard value={data.orgCompletion} confidence={data.aiConfidence} />
              </FadeIn>
              <FadeIn className="xl:col-span-5 2xl:col-span-6" delay={0.08}>
                <GoalRiskTable rows={data.goalRisks} />
              </FadeIn>
              <FadeIn className="xl:col-span-8 2xl:col-span-2 2xl:row-span-2" delay={0.12}>
                <ActivityFeed activities={data.activities} />
              </FadeIn>
              <FadeIn className="xl:col-span-4 2xl:col-span-3" delay={0.16}>
                <OrgHealthCard data={data.radarMetrics} />
              </FadeIn>
              <FadeIn className="xl:col-span-4 2xl:col-span-3" delay={0.2}>
                <WorkflowVisualization nodes={data.workflowNodes} />
              </FadeIn>
              <FadeIn className="xl:col-span-8 2xl:col-span-4" delay={0.24}>
                <PendingApprovalsPanel approvals={data.approvals} />
              </FadeIn>
              <FadeIn className="xl:col-span-3 2xl:col-span-4" delay={0.28}>
                <AnalyticsCard data={data.trendData} />
              </FadeIn>
              <FadeIn className="xl:col-span-5 2xl:col-span-6" delay={0.32}>
                <GoalAlignmentTree tree={data.alignmentTree} />
              </FadeIn>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
