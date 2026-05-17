"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/shared/toast-provider";
import { useSaveCheckin } from "@/hooks/use-checkins";
import { useMyGoalSheet } from "@/hooks/use-goals";
import { activeQuarter, quarterIsOpen } from "@/lib/cycle-windows";
import type { ApiGoal, CheckinStatus, Quarter } from "@/types/api";

const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
const statuses: CheckinStatus[] = ["not_started", "on_track", "completed"];

function scorePreview(goal: ApiGoal, actual: number) {
  if (goal.uom_type === "timeline") return 0;
  const target = Number(goal.target ?? 100);
  if (!target) return 0;
  if (goal.uom_type === "numeric_max") return Math.min(150, Math.round((target / Math.max(actual, 1)) * 100));
  if (goal.uom_type === "zero") return actual === 0 ? 100 : 0;
  return Math.min(150, Math.round((actual / target) * 100));
}

export function CheckinWorkspace() {
  const { data: sheet } = useMyGoalSheet();
  const saveCheckin = useSaveCheckin();
  const toast = useToast();
  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [actualDates, setActualDates] = useState<Record<string, string>>({});
  const [statusByGoal, setStatusByGoal] = useState<Record<string, CheckinStatus>>({});
  const goals = useMemo(() => sheet?.goals ?? [], [sheet?.goals]);
  const openQuarter = activeQuarter(sheet?.cycle);
  const selectedQuarterOpen = quarterIsOpen(sheet?.cycle, quarter);

  async function save(goal: ApiGoal) {
    const isTimeline = goal.uom_type === "timeline";
    await saveCheckin.mutateAsync({
      goal_id: goal.id,
      quarter,
      planned_value: isTimeline ? null : goal.target,
      actual_value: isTimeline ? null : actuals[goal.id] ?? 0,
      actual_date: isTimeline ? actualDates[goal.id] : null,
      status: statusByGoal[goal.id] ?? "on_track"
    });
    toast.notify({ title: "Check-in saved", detail: `${quarter} progress was captured for ${goal.title}.` });
  }

  return (
    <>
      <PageHeader
        title="Quarterly Check-ins"
        description="Capture planned vs actual achievement with live scoring and manager-review readiness."
      />
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <CalendarClock className="text-cyan-200" />
            <div>
              <div className="font-semibold text-white">{quarter} Achievement Update</div>
              <div className="text-sm text-slate-400">
                Window status: {openQuarter ? `${openQuarter} active` : "not open"} for {sheet?.cycle?.name ?? "active cycle"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {quarters.map((item) => (
              <Button key={item} size="sm" variant={quarter === item ? "default" : "outline"} onClick={() => setQuarter(item)}>
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal Check-in Table</CardTitle>
          <Badge tone={sheet?.status === "locked" ? "emerald" : "amber"}>{sheet?.status ?? "loading"}</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px] divide-y divide-white/[0.07]">
            {goals.map((goal) => {
              const actual = actuals[goal.id] ?? Number(goal.target ?? 0);
              const score = scorePreview(goal, actual);
              const isTimeline = goal.uom_type === "timeline";
              return (
                <div key={goal.id} className="grid grid-cols-[1.2fr_.7fr_.8fr_.8fr_1fr_.6fr] items-center gap-4 py-4">
                  <div>
                    <div className="font-semibold text-white">{goal.title}</div>
                    <div className="text-sm text-slate-400">{goal.thrust_area}</div>
                  </div>
                  <div className="text-sm text-slate-300">{isTimeline ? goal.target_date ?? "No date" : goal.target ?? "0"}</div>
                  {isTimeline ? (
                    <input
                      type="date"
                      value={actualDates[goal.id] ?? ""}
                      onChange={(event) => setActualDates({ ...actualDates, [goal.id]: event.target.value })}
                      className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none"
                    />
                  ) : (
                    <input
                      type="number"
                      value={actual}
                      onChange={(event) => setActuals({ ...actuals, [goal.id]: Number(event.target.value) })}
                      className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none"
                    />
                  )}
                  <select
                    value={statusByGoal[goal.id] ?? "on_track"}
                    onChange={(event) => setStatusByGoal({ ...statusByGoal, [goal.id]: event.target.value as CheckinStatus })}
                    className="h-10 rounded-md border border-white/10 bg-[#1a2230] px-2 text-sm outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                  <div>
                    <div className="mb-1 text-xs text-slate-400">
                      {isTimeline ? `Due ${goal.target_date ?? "-"}; actual ${actualDates[goal.id] ?? "-"}` : `${actual} / ${goal.target ?? 100} = ${score}%`}
                    </div>
                    <Progress value={Math.min(score, 100)} />
                  </div>
                  <Button size="sm" disabled={saveCheckin.isPending || sheet?.status !== "locked" || !selectedQuarterOpen} onClick={() => save(goal)}>
                    <Save size={14} />
                    Save
                  </Button>
                </div>
              );
            })}
            {!goals.length ? (
              <div className="grid min-h-40 place-items-center text-slate-400">
                No goals available. Approved and locked goals will appear here.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
