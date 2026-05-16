"use client";

import { useMemo, useState } from "react";
import { Plus, Save, Send, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { WeightageRing } from "@/components/goals/weightage-ring";
import { useToast } from "@/components/shared/toast-provider";
import { generateGoalInsights } from "@/features/insights/insight-engine";
import { useAddGoal, useMyGoalSheet, useSubmitGoalSheet, useUpdateGoal } from "@/hooks/use-goals";
import type { ApiGoal, GoalCreateRequest, UomType } from "@/types/api";

const thrustAreas = ["Customer Growth", "Operational Excellence", "People Capability", "Compliance", "Platform Scale"];
const uomTypes: Array<{ value: UomType; label: string }> = [
  { value: "numeric_min", label: "Numeric Min" },
  { value: "numeric_max", label: "Numeric Max" },
  { value: "timeline", label: "Timeline" },
  { value: "zero", label: "Zero-based" }
];

const draftGoal: GoalCreateRequest = {
  title: "",
  description: "",
  thrust_area: thrustAreas[0],
  uom_type: "numeric_min",
  target: 100,
  weightage: 10,
  is_shared: false
};

function weightageMessage(total: number) {
  if (total === 100) return "Goal allocation totals exactly 100%. This plan is ready for submission.";
  if (total < 100) return `Goal allocation currently totals ${total}%. Add ${100 - total}% more before submission.`;
  return `Goal allocation currently totals ${total}%. Reduce ${total - 100}% before submission.`;
}

export function GoalWorkspace() {
  const { data: sheet, isLoading } = useMyGoalSheet();
  const addGoal = useAddGoal(sheet?.id);
  const updateGoal = useUpdateGoal(sheet?.id);
  const submitSheet = useSubmitGoalSheet(sheet?.id);
  const toast = useToast();
  const [form, setForm] = useState<GoalCreateRequest>(draftGoal);

  const goals = useMemo(() => sheet?.goals ?? [], [sheet?.goals]);
  const total = useMemo(() => goals.reduce((sum, goal) => sum + Number(goal.weightage), 0), [goals]);
  const insights = generateGoalInsights(sheet);
  const canSubmit = total === 100 && goals.length > 0 && goals.length <= 8 && sheet?.status !== "locked";

  async function handleAddGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addGoal.mutateAsync(form);
    toast.notify({ title: "Goal added", detail: "Draft saved and validation recalculated." });
    setForm({ ...draftGoal, weightage: Math.max(10, 100 - total) });
  }

  async function handleWeightChange(goal: ApiGoal, weightage: number) {
    await updateGoal.mutateAsync({
      goalId: goal.id,
      body: { version: sheet!.version, weightage }
    });
  }

  return (
    <>
      <PageHeader title="Goals" description="Create, validate, and submit enterprise goal sheets for approval." />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Goal Creation Workspace</CardTitle>
            <Badge tone={sheet?.status === "locked" ? "emerald" : "cyan"}>{sheet?.status ?? "loading"}</Badge>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleAddGoal}>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Goal title"
                  className="h-11 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none focus:border-cyan-300/40"
                  required
                />
                <select
                  value={form.thrust_area}
                  onChange={(event) => setForm({ ...form, thrust_area: event.target.value })}
                  className="h-11 rounded-md border border-white/10 bg-[#1a2230] px-3 text-sm outline-none"
                >
                  {thrustAreas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={form.description ?? ""}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Goal description, success criteria, business context..."
                className="min-h-20 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm outline-none focus:border-cyan-300/40"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={form.uom_type}
                  onChange={(event) => setForm({ ...form, uom_type: event.target.value as UomType })}
                  className="h-11 rounded-md border border-white/10 bg-[#1a2230] px-3 text-sm outline-none"
                >
                  {uomTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  value={String(form.target ?? "")}
                  onChange={(event) => setForm({ ...form, target: event.target.value })}
                  placeholder="Target"
                  className="h-11 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none"
                />
                <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3">
                  <SlidersHorizontal size={16} className="text-cyan-200" />
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Number(form.weightage)}
                    onChange={(event) => setForm({ ...form, weightage: Number(event.target.value) })}
                    className="min-w-0 flex-1"
                  />
                  <span className="w-10 text-right text-sm font-semibold">{form.weightage}%</span>
                </div>
              </div>
              <Button disabled={addGoal.isPending || goals.length >= 8 || isLoading}>
                <Plus size={16} />
                Add Goal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <WeightageRing total={total} message={weightageMessage(total)} />
          <Card>
            <CardHeader>
              <CardTitle>AI-Style Plan Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{insight.title}</div>
                    <Badge
                      tone={
                        insight.severity === "critical"
                          ? "rose"
                          : insight.severity === "warning"
                            ? "amber"
                            : "cyan"
                      }
                    >
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{insight.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Draft Goal Sheet</CardTitle>
          <Button
            disabled={!canSubmit || submitSheet.isPending}
            onClick={() =>
              submitSheet.mutate(sheet!.version, {
                onSuccess: () => toast.notify({ title: "Submitted for approval", detail: "Manager workflow has been notified." })
              })
            }
          >
            <Send size={16} />
            Submit for Approval
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[820px] divide-y divide-white/[0.07]">
            {goals.map((goal) => (
              <div key={goal.id} className="grid grid-cols-[1.2fr_.8fr_.7fr_1fr_.7fr] items-center gap-4 py-4">
                <div>
                  <div className="font-semibold text-white">{goal.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{goal.description}</div>
                </div>
                <Badge tone="slate">{goal.thrust_area}</Badge>
                <span className="text-sm text-slate-300">{goal.uom_type}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Number(goal.weightage)}
                    onChange={(event) => handleWeightChange(goal, Number(event.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-semibold">{goal.weightage}%</span>
                </div>
                <Progress value={Number(goal.weightage)} />
              </div>
            ))}
            {!goals.length ? (
              <div className="grid min-h-40 place-items-center text-center text-slate-400">
                <div>
                  <Save className="mx-auto mb-3 text-cyan-200" />
                  Create your first goal to begin the workflow.
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
