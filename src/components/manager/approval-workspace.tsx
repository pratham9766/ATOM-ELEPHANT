"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { generateGoalInsights } from "@/features/insights/insight-engine";
import { useApproveSheet, useReturnSheet, useTeamSubmissions } from "@/hooks/use-manager";
import { useToast } from "@/components/shared/toast-provider";

export function ApprovalWorkspace() {
  const { data: submissions = [], isLoading } = useTeamSubmissions();
  const approve = useApproveSheet();
  const returnSheet = useReturnSheet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("Please rebalance goal allocation and clarify target ownership.");
  const toast = useToast();
  const selected = useMemo(
    () => submissions.find((sheet) => sheet.id === (selectedId ?? submissions[0]?.id)),
    [selectedId, submissions]
  );
  const insights = generateGoalInsights(selected);
  const total = selected?.goals.reduce((sum, goal) => sum + Number(goal.weightage), 0) ?? 0;

  return (
    <>
      <PageHeader title="Manager Approval Workspace" description="Review submitted goal sheets with split-pane workflow controls." />
      <div className="grid gap-4 xl:grid-cols-[.38fr_.62fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
            <Badge tone="amber">{submissions.length} in queue</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <div className="h-28 animate-pulse rounded-md bg-white/[0.05]" /> : null}
            {submissions.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedId(sheet.id)}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{sheet.user?.name ?? `Employee ${sheet.user_id.slice(0, 6)}`}</div>
                  <Badge tone={sheet.status === "submitted" ? "amber" : "slate"}>{sheet.status}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={13} />
                  SLA: review within 3 business days
                </div>
              </button>
            ))}
            {!submissions.length && !isLoading ? (
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
                No pending submissions. The approval lane is clear.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 2xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Goal Review Table</CardTitle>
              <Badge tone={total === 100 ? "emerald" : "amber"}>{total}% allocated</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected?.goals.map((goal) => (
                <div key={goal.id} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{goal.title}</div>
                      <div className="mt-1 text-sm text-slate-400">{goal.description}</div>
                    </div>
                    <Badge tone="slate">{goal.thrust_area}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_160px]">
                    <Progress value={Number(goal.weightage)} />
                    <div className="text-sm font-semibold text-cyan-100">{goal.weightage}% weight</div>
                    <div className="text-sm text-slate-400">{goal.uom_type}</div>
                  </div>
                </div>
              ))}
              {!selected ? <div className="text-sm text-slate-400">Select a submission to review.</div> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Panel</CardTitle>
              <Sparkles size={18} className="text-cyan-200" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {insights.map((insight) => (
                  <div key={insight.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-sm font-semibold text-white">{insight.title}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{insight.detail}</p>
                  </div>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 w-full rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm outline-none focus:border-cyan-300/40"
              />
              <div className="grid gap-2">
                <Button
                  disabled={!selected || approve.isPending}
                  onClick={() =>
                    selected &&
                    approve.mutate(selected.id, {
                      onSuccess: () => toast.notify({ title: "Goals approved", detail: "The sheet is now locked and audit-ready." })
                    })
                  }
                >
                  <CheckCircle2 size={16} />
                  Approve and Lock
                </Button>
                <Button
                  variant="outline"
                  disabled={!selected || returnSheet.isPending}
                  onClick={() =>
                    selected &&
                    returnSheet.mutate(
                      { sheetId: selected.id, comment },
                      {
                        onSuccess: () =>
                          toast.notify({ title: "Returned for rework", detail: "Employee has been routed back to draft updates." })
                      }
                    )
                  }
                >
                  <RotateCcw size={16} />
                  Return for Rework
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
