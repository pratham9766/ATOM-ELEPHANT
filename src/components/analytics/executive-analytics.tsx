"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Users } from "lucide-react";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { OrgHealthCard } from "@/components/dashboard/org-health-card";
import { PageHeader } from "@/components/layout/page-header";
import { MetricPill } from "@/components/shared/metric-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateExecutiveInsights } from "@/features/insights/insight-engine";
import { analyticsService } from "@/services/analytics-service";

export function ExecutiveAnalytics() {
  const { data } = useQuery({
    queryKey: ["analytics", "org-summary"],
    queryFn: analyticsService.orgSummary,
    retry: 1
  });
  const insights = generateExecutiveInsights(data);
  const trendData = (data?.departments ?? []).map((department) => ({
    name: department.department,
    completed: department.locked,
    forecast: department.total
  }));
  const radarMetrics = [
    { metric: "Completion", value: data?.completion_rate ?? 0 },
    { metric: "Submitted", value: data?.submitted_sheets ?? 0 },
    { metric: "Locked", value: data?.locked_sheets ?? 0 },
    { metric: "Managers", value: data?.manager_effectiveness.length ?? 0 },
    { metric: "Thrust Areas", value: data?.thrust_areas.length ?? 0 }
  ];

  return (
    <>
      <PageHeader title="Analytics" description="Executive-ready performance intelligence and operating signals." />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MetricPill label="Completion Rate" value={`${data?.completion_rate ?? 0}%`} tone="text-cyan-200" />
        <MetricPill label="Submitted Sheets" value={String(data?.submitted_sheets ?? 0)} tone="text-emerald-200" />
        <MetricPill label="Locked Plans" value={String(data?.locked_sheets ?? 0)} tone="text-amber-200" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AnalyticsCard data={trendData} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Executive Intelligence</CardTitle>
            <TrendingUp size={18} className="text-cyan-200" />
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{insight.title}</div>
                  <Badge tone={insight.severity === "success" ? "emerald" : "amber"}>{insight.severity}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{insight.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <OrgHealthCard data={radarMetrics} />
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Risk Heatmap</CardTitle>
            <Activity size={18} className="text-cyan-200" />
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-4">
            {(data?.departments ?? []).map((dept) => (
                <div key={dept.department} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{dept.department}</span>
                    <Users size={14} className="text-slate-500" />
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                      style={{ width: `${Math.min(100, dept.completion_rate)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{dept.locked}/{dept.total} locked</div>
                </div>
              ))}
            {!(data?.departments ?? []).length ? (
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                No live department analytics yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
