"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, MessageSquare, RotateCcw, Save, Search, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { generateGoalInsights } from "@/features/insights/insight-engine";
import { useApproveSheet, useCreateSharedGoal, useInlineEditGoal, useReturnSheet, useTeamCheckins } from "@/hooks/use-manager";
import { useToast } from "@/components/shared/toast-provider";
import { activeQuarter } from "@/lib/cycle-windows";
import type { ApiApprovalSheet, ApiGoal, Quarter } from "@/types/api";

const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function completionFor(sheet: ApiApprovalSheet, quarter: Quarter) {
  const checkins = sheet.goals.flatMap((goal) => goal.checkins ?? []).filter((checkin) => checkin.quarter === quarter);
  if (!checkins.length) return 0;
  const total = checkins.reduce((sum, checkin) => sum + Number(checkin.progress_score ?? 0), 0);
  return Math.round((total / checkins.length) * 100);
}

function statusTone(status: string, completion: number) {
  if (status === "locked" && completion >= 90) return "emerald";
  if (status === "submitted" || completion < 60) return "amber";
  if (status === "rework") return "rose";
  return "slate";
}

export function ApprovalWorkspace() {
  const { data: submissions = [], isLoading } = useTeamCheckins();
  const approve = useApproveSheet();
  const returnSheet = useReturnSheet();
  const inlineEdit = useInlineEditGoal();
  const createSharedGoal = useCreateSharedGoal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("Please rebalance goal allocation and clarify target ownership.");
  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [minimumCompletion, setMinimumCompletion] = useState(0);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { target: string; weightage: string; description: string }>>({});
  const [sharedGoal, setSharedGoal] = useState({ title: "", target: "100", weightage: "10" });
  const toast = useToast();

  const departments = useMemo(
    () => Array.from(new Set(submissions.map((sheet) => sheet.user?.department ?? "Unassigned"))),
    [submissions]
  );
  const filtered = useMemo(
    () =>
      submissions.filter((sheet) => {
        const completion = completionFor(sheet, quarter);
        const matchesDepartment = department === "all" || (sheet.user?.department ?? "Unassigned") === department;
        const matchesStatus = status === "all" || sheet.status === status;
        return matchesDepartment && matchesStatus && completion >= minimumCompletion;
      }),
    [department, minimumCompletion, quarter, status, submissions]
  );
  const selected = useMemo(
    () => filtered.find((sheet) => sheet.id === (selectedId ?? filtered[0]?.id)) ?? filtered[0],
    [filtered, selectedId]
  );
  const insights = generateGoalInsights(selected);
  const total = selected?.goals.reduce((sum, goal) => sum + Number(goal.weightage), 0) ?? 0;
  const selectedCompletion = selected ? completionFor(selected, quarter) : 0;
  const quarterWindow = activeQuarter(selected?.cycle);
  const canManagerEditSelected = selected?.status === "submitted" || selected?.status === "rework";

  function draftFor(goal: ApiGoal) {
    return (
      drafts[goal.id] ?? {
        target: String(goal.uom_type === "timeline" ? goal.target_date ?? "" : goal.target ?? ""),
        weightage: String(goal.weightage),
        description: goal.description ?? ""
      }
    );
  }

  async function saveGoal(goal: ApiGoal) {
    if (!selected) return;
    if (!canManagerEditSelected) {
      toast.notify({ title: "Editing locked", detail: "Manager inline edits are available while a sheet is submitted or returned for rework." });
      return;
    }
    const draft = draftFor(goal);
    const nextTotal = selected.goals.reduce(
      (sum, item) => sum + Number(item.id === goal.id ? draft.weightage : item.weightage),
      0
    );
    if (nextTotal > 100) {
      toast.notify({ title: "Weightage blocked", detail: "Total goal weightage cannot exceed 100%." });
      return;
    }
    try {
      await inlineEdit.mutateAsync({
        sheetId: selected.id,
        goalId: goal.id,
        body:
          goal.uom_type === "timeline"
            ? { version: selected.version, target_date: draft.target || null, weightage: draft.weightage, description: draft.description }
            : { version: selected.version, target: draft.target || null, weightage: draft.weightage, description: draft.description }
      });
      toast.notify({ title: "Goal updated", detail: "Manager edits were saved with version protection." });
    } catch (error) {
      toast.notify({ title: "Goal update failed", detail: error instanceof Error ? error.message : "Reload and try again." });
    }
  }

  async function addSharedGoal() {
    if (!sharedGoal.title.trim()) return;
    try {
      await createSharedGoal.mutateAsync({
        title: sharedGoal.title,
        description: "Shared enterprise priority assigned by manager.",
        thrust_area: "Operational Excellence",
        uom_type: "numeric_min",
        target: sharedGoal.target,
        weightage: sharedGoal.weightage,
        is_shared: true
      });
      setSharedGoal({ title: "", target: "100", weightage: "10" });
      toast.notify({ title: "Shared goal created", detail: "Eligible team draft sheets received the shared goal." });
    } catch (error) {
      toast.notify({ title: "Shared goal not assigned", detail: error instanceof Error ? error.message : "No eligible draft sheets were available." });
    }
  }

  return (
    <>
      <PageHeader title="Manager Team Workspace" description="Review approvals and monitor quarterly check-ins across direct reports." />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
          <Search size={16} className="text-cyan-200" />
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 flex-1 bg-transparent text-sm outline-none">
            <option value="all">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-white/10 bg-[#1a2230] px-3 text-sm outline-none">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="rework">Returned</option>
          <option value="locked">Locked</option>
        </select>
        <select value={quarter} onChange={(event) => setQuarter(event.target.value as Quarter)} className="h-10 rounded-md border border-white/10 bg-[#1a2230] px-3 text-sm outline-none">
          {quarters.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm">
          <span className="text-slate-400">Min</span>
          <input type="number" min={0} max={150} value={minimumCompletion} onChange={(event) => setMinimumCompletion(Number(event.target.value))} className="h-10 w-16 bg-transparent outline-none" />
          <span className="text-slate-400">%</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.38fr_.62fr]">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <Badge tone="cyan">{filtered.length} visible</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <div className="h-32 animate-pulse rounded-md bg-white/[0.05]" /> : null}
            {filtered.map((sheet) => {
              const completion = completionFor(sheet, quarter);
              return (
                <button
                  key={sheet.id}
                  onClick={() => setSelectedId(sheet.id)}
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{sheet.user?.name ?? `Employee ${sheet.user_id.slice(0, 6)}`}</div>
                      <div className="text-xs text-slate-500">{sheet.user?.department ?? "Unassigned"}</div>
                    </div>
                    <Badge tone={statusTone(sheet.status, completion)}>{sheet.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={Math.min(completion, 100)} />
                    <span className="w-12 text-right text-xs font-semibold text-cyan-100">{completion}%</span>
                  </div>
                </button>
              );
            })}
            {!filtered.length && !isLoading ? (
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
                No team records match the selected filters.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 2xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Check-in and Goal Detail</CardTitle>
              <div className="flex items-center gap-2">
                <Badge tone={quarterWindow === quarter ? "emerald" : "slate"}>{quarterWindow ?? "no quarter"} active</Badge>
                <Badge tone={total === 100 ? "emerald" : "amber"}>{total}% allocated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-500">Employee</div>
                    <div className="mt-1 font-semibold text-white">{selected.user?.name ?? selected.user_id.slice(0, 8)}</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-500">{quarter} completion</div>
                    <div className="mt-1 font-semibold text-white">{selectedCompletion}%</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-500">Cycle</div>
                    <div className="mt-1 font-semibold text-white">{selected.cycle?.name ?? "Active cycle"}</div>
                  </div>
                </motion.div>
              ) : null}

              {selected?.goals.map((goal) => {
                const checkin = (goal.checkins ?? []).find((item) => item.quarter === quarter);
                const draft = draftFor(goal);
                return (
                  <div key={goal.id} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                    <button className="w-full text-left" onClick={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{goal.title}</div>
                          <div className="mt-1 text-sm text-slate-400">{goal.description}</div>
                        </div>
                        <div className="flex gap-2">
                          {goal.is_shared ? <Badge tone="cyan">shared</Badge> : null}
                          <Badge tone="slate">{goal.thrust_area}</Badge>
                        </div>
                      </div>
                    </button>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_110px_110px_130px]">
                      <Progress value={Math.min(Number(checkin?.progress_score ?? 0) * 100, 100)} />
                      <div className="text-sm text-slate-300">Plan {checkin?.planned_value ?? goal.target ?? "-"}</div>
                      <div className="text-sm text-slate-300">Actual {checkin?.actual_value ?? checkin?.actual_date ?? "-"}</div>
                      <Badge tone={checkin?.status === "completed" ? "emerald" : checkin ? "amber" : "slate"}>
                        {checkin?.status ?? "not started"}
                      </Badge>
                    </div>
                    {expandedGoalId === goal.id ? (
                      <div className="mt-4 grid gap-3 rounded-md border border-white/10 bg-black/10 p-3 md:grid-cols-[1fr_120px_110px_auto]">
                        <textarea
                          value={draft.description}
                          onChange={(event) => setDrafts({ ...drafts, [goal.id]: { ...draft, description: event.target.value } })}
                          className="min-h-20 rounded-md border border-white/10 bg-white/[0.05] p-2 text-sm outline-none"
                        />
                        <input
                          value={draft.target}
                          onChange={(event) => setDrafts({ ...drafts, [goal.id]: { ...draft, target: event.target.value } })}
                          placeholder={goal.uom_type === "timeline" ? "YYYY-MM-DD" : "Target"}
                          className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-2 text-sm outline-none"
                        />
                        <input
                          value={draft.weightage}
                          onChange={(event) => setDrafts({ ...drafts, [goal.id]: { ...draft, weightage: event.target.value } })}
                          className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-2 text-sm outline-none"
                        />
                        <Button size="sm" disabled={inlineEdit.isPending || !canManagerEditSelected} onClick={() => saveGoal(goal)}>
                          <Save size={14} />
                          Save
                        </Button>
                        <div className="md:col-span-4 text-xs text-slate-500">
                          {canManagerEditSelected
                            ? "Manager feedback is stored in the goal description for this MVP. Check-in comments remain visible in the activity trail."
                            : "This sheet is locked or draft-only; use Return for Rework or Admin Unlock before editing."}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {!selected ? <div className="text-sm text-slate-400">Select a team member to review.</div> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Panel</CardTitle>
              <Sparkles size={18} className="text-cyan-200" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <Users size={16} className="mb-2 text-cyan-200" />
                  <div className="font-semibold text-white">{submissions.length}</div>
                  <div className="text-xs text-slate-500">direct reports</div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <Clock size={16} className="mb-2 text-amber-200" />
                  <div className="font-semibold text-white">{submissions.filter((sheet) => sheet.status === "submitted").length}</div>
                  <div className="text-xs text-slate-500">pending review</div>
                </div>
              </div>
              {insights.map((insight) => (
                <div key={insight.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-sm font-semibold text-white">{insight.title}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{insight.detail}</p>
                </div>
              ))}
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28 w-full rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm outline-none focus:border-cyan-300/40"
              />
              <div className="grid gap-2">
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-2 text-sm font-semibold text-white">Shared Goal</div>
                  <div className="grid gap-2">
                    <input
                      value={sharedGoal.title}
                      onChange={(event) => setSharedGoal({ ...sharedGoal, title: event.target.value })}
                      placeholder="Shared goal title"
                      className="h-9 rounded-md border border-white/10 bg-white/[0.05] px-2 text-sm outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={sharedGoal.target}
                        onChange={(event) => setSharedGoal({ ...sharedGoal, target: event.target.value })}
                        placeholder="Target"
                        className="h-9 rounded-md border border-white/10 bg-white/[0.05] px-2 text-sm outline-none"
                      />
                      <input
                        value={sharedGoal.weightage}
                        onChange={(event) => setSharedGoal({ ...sharedGoal, weightage: event.target.value })}
                        placeholder="Weight"
                        className="h-9 rounded-md border border-white/10 bg-white/[0.05] px-2 text-sm outline-none"
                      />
                    </div>
                    <Button variant="outline" size="sm" disabled={createSharedGoal.isPending || !sharedGoal.title.trim()} onClick={addSharedGoal}>
                      Assign Shared Goal
                    </Button>
                  </div>
                </div>
                <Button disabled={!selected || approve.isPending} onClick={() => selected && approve.mutate(selected.id, { onSuccess: () => toast.notify({ title: "Goals approved", detail: "The sheet is now locked and audit-ready." }) })}>
                  <CheckCircle2 size={16} />
                  Approve and Lock
                </Button>
                <Button variant="outline" disabled={!selected || returnSheet.isPending} onClick={() => selected && returnSheet.mutate({ sheetId: selected.id, comment }, { onSuccess: () => toast.notify({ title: "Returned for rework", detail: "Employee has been routed back to updates." }) })}>
                  <RotateCcw size={16} />
                  Return for Rework
                </Button>
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
                  <MessageSquare size={14} className="mb-2 text-cyan-200" />
                  Manager comments and approval actions are audit logged for demo traceability.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
