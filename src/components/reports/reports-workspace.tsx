"use client";

import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricPill } from "@/components/shared/metric-pill";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportSummary } from "@/hooks/use-reports";
import { reportsService } from "@/services/reports-service";

export function ReportsWorkspace() {
  const { data, isLoading } = useReportSummary();
  const toast = useToast();

  async function downloadAchievementCsv() {
    const csv = await reportsService.achievementCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "elephant-achievement-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.notify({ title: "Report exported", detail: "Achievement CSV was generated from live backend data." });
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Export achievement reports and governance summaries from the live workflow dataset."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <MetricPill label="Goal Sheets" value={String(data?.goal_sheets ?? (isLoading ? "..." : 0))} tone="text-cyan-200" />
        <MetricPill label="Goals" value={String(data?.goals ?? (isLoading ? "..." : 0))} tone="text-emerald-200" />
        <MetricPill label="Check-ins" value={String(data?.checkins ?? (isLoading ? "..." : 0))} tone="text-amber-200" />
        <MetricPill
          label="Check-in Rate"
          value={`${data?.checkin_completion_rate ?? (isLoading ? "..." : 0)}%`}
          tone="text-sky-200"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Achievement Export</CardTitle>
            <FileSpreadsheet className="text-cyan-200" size={18} />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-400">
              Generates employee, goal, target, weightage, actual achievement, score, and status rows for audit and HR review.
            </p>
            <Button onClick={downloadAchievementCsv}>
              <Download size={16} />
              Download CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Governance Readiness</CardTitle>
            <ShieldCheck className="text-emerald-200" size={18} />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">JWT/RBAC enforced before export generation.</div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">Large Excel exports are Celery-ready through the reports task module.</div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">Audit logs capture workflow changes before reporting.</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
