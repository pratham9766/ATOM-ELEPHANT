"use client";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { GoalAlignmentTree } from "@/components/dashboard/goal-alignment-tree";
import { OrgHealthCard } from "@/components/dashboard/org-health-card";
import { OrgPerformanceCard } from "@/components/dashboard/org-performance-card";
import { PendingApprovalsPanel } from "@/components/dashboard/pending-approvals-panel";
import { WorkflowVisualization } from "@/components/dashboard/workflow-visualization";
import { GoalRiskTable } from "@/components/tables/goal-risk-table";
import { FadeIn } from "@/components/animations/fade-in";
import { PageHeader } from "@/components/layout/page-header";
import { MetricPill } from "@/components/shared/metric-pill";
import { liveSignals } from "@/constants/navigation";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function DashboardHome() {
  const { data, isLoading } = useDashboardData();

  return (
    <>
      <PageHeader
        title="Enterprise Performance Command Center"
        description="AI-augmented goals, approvals, risks, and operating intelligence."
      />
      <div className="mb-4 grid grid-cols-3 gap-2">
        {liveSignals.map((signal) => (
          <MetricPill key={signal.label} {...signal} />
        ))}
      </div>

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
    </>
  );
}
