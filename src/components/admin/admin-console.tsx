"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, LockOpen, RadioTower, RefreshCcw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { AuditExplorer } from "@/components/admin/audit-explorer";
import { useAdminOverview, useCreateCycle, useForceSubmitSheet, useUnlockSheet, useUpdateCycle } from "@/hooks/use-admin";
import { useToast } from "@/components/shared/toast-provider";
import { isGoalWindowOpen, activeQuarter } from "@/lib/cycle-windows";
import { relativeTime } from "@/lib/time";
import type { CycleCreateRequest } from "@/types/api";

function toLocalInput(value: string) {
  return value.slice(0, 16);
}

function toIso(value: string) {
  return new Date(value).toISOString();
}

function defaultCycle(): CycleCreateRequest {
  const now = new Date();
  const plus = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 16);
  return {
    name: `FY ${now.getFullYear()} Performance Cycle`,
    goal_window_open: plus(-7),
    goal_window_close: plus(14),
    q1_open: plus(15),
    q2_open: plus(105),
    q3_open: plus(195),
    q4_open: plus(285),
    is_active: true
  };
}

export function AdminConsole() {
  const { data, isLoading } = useAdminOverview();
  const createCycle = useCreateCycle();
  const updateCycle = useUpdateCycle();
  const unlockSheet = useUnlockSheet();
  const forceSubmit = useForceSubmitSheet();
  const toast = useToast();
  const activeCycle = data?.cycles.find((cycle) => cycle.is_active);
  const [cycleForm, setCycleForm] = useState<CycleCreateRequest>(defaultCycle());
  const [sheetId, setSheetId] = useState("");
  const [unlockReason, setUnlockReason] = useState("Admin demo unlock requested for workflow recovery.");
  const goalWindowOpen = isGoalWindowOpen(activeCycle);
  const currentQuarter = activeQuarter(activeCycle);

  const adminInsights = useMemo(() => {
    const openEvents = data?.events.filter((event) => event.status === "open").length ?? 0;
    const managers = data?.users.filter((user) => user.role === "manager").length ?? 0;
    return [
      `${openEvents} escalation event${openEvents === 1 ? "" : "s"} currently open`,
      `${managers} manager${managers === 1 ? "" : "s"} configured for approval routing`,
      goalWindowOpen ? "Goal submission window is open" : "Goal submission window is closed"
    ];
  }, [data?.events, data?.users, goalWindowOpen]);

  async function submitCycle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...cycleForm,
      goal_window_open: toIso(cycleForm.goal_window_open),
      goal_window_close: toIso(cycleForm.goal_window_close),
      q1_open: toIso(cycleForm.q1_open),
      q2_open: toIso(cycleForm.q2_open),
      q3_open: toIso(cycleForm.q3_open),
      q4_open: toIso(cycleForm.q4_open)
    };
    await createCycle.mutateAsync(payload);
    toast.notify({ title: "Cycle created", detail: "Cycle windows are now available for live workflow enforcement." });
  }

  async function toggleGoalWindow(open: boolean) {
    if (!activeCycle) return;
    const now = new Date();
    const close = new Date(now.getTime() + 14 * 86400000);
    await updateCycle.mutateAsync({
      cycleId: activeCycle.id,
      body: open
        ? { goal_window_open: now.toISOString(), goal_window_close: close.toISOString() }
        : { goal_window_close: new Date(now.getTime() - 60000).toISOString() }
    });
    toast.notify({ title: open ? "Goal window opened" : "Goal window closed", detail: "Cycle configuration was updated safely." });
  }

  return (
    <>
      <PageHeader
        title="Admin Control Center"
        description="Cycle governance, audit readiness, escalation oversight, and enterprise workflow controls."
      />

      <div className="mb-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Management</CardTitle>
            <CalendarPlus className="text-cyan-200" size={18} />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="font-semibold text-white">{activeCycle?.name ?? "No active cycle"}</div>
              <div className="mt-1 text-sm text-slate-400">
                Goal window {goalWindowOpen ? "open" : "closed"} · {currentQuarter ?? "No quarter"} active
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
              <span>{data?.cycles.length ?? 0} cycles</span>
              <span>{data?.users.length ?? 0} users</span>
              <span>{data?.users.filter((user) => user.role === "manager").length ?? 0} managers</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={!activeCycle || updateCycle.isPending} onClick={() => toggleGoalWindow(true)}>
                Open Window
              </Button>
              <Button variant="outline" disabled={!activeCycle || updateCycle.isPending} onClick={() => toggleGoalWindow(false)}>
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Create/Edit Cycle</CardTitle>
            <Badge tone={cycleForm.is_active ? "emerald" : "slate"}>{cycleForm.is_active ? "active on create" : "inactive"}</Badge>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitCycle}>
              <input value={cycleForm.name} onChange={(event) => setCycleForm({ ...cycleForm, name: event.target.value })} className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none md:col-span-2" />
              {(["goal_window_open", "goal_window_close", "q1_open", "q2_open", "q3_open", "q4_open"] as const).map((field) => (
                <label key={field} className="text-xs text-slate-500">
                  {field.replaceAll("_", " ")}
                  <input
                    type="datetime-local"
                    value={toLocalInput(cycleForm[field])}
                    onChange={(event) => setCycleForm({ ...cycleForm, [field]: event.target.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-slate-200 outline-none"
                  />
                </label>
              ))}
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300">
                <input type="checkbox" checked={cycleForm.is_active} onChange={(event) => setCycleForm({ ...cycleForm, is_active: event.target.checked })} />
                Activate
              </label>
              <Button disabled={createCycle.isPending}>Create Cycle</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[.45fr_.55fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Overrides</CardTitle>
            <LockOpen className="text-cyan-200" size={18} />
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              value={sheetId}
              onChange={(event) => setSheetId(event.target.value)}
              placeholder="Goal sheet ID"
              className="h-10 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm outline-none"
            />
            <textarea
              value={unlockReason}
              onChange={(event) => setUnlockReason(event.target.value)}
              className="min-h-20 w-full rounded-md border border-white/10 bg-white/[0.05] p-3 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={!sheetId || unlockSheet.isPending}
                onClick={() =>
                  unlockSheet.mutate(
                    { sheetId, reason: unlockReason },
                    { onSuccess: () => toast.notify({ title: "Sheet unlocked", detail: "Employee can rework goals safely." }) }
                  )
                }
              >
                <LockOpen size={15} />
                Unlock
              </Button>
              <Button
                variant="outline"
                disabled={!sheetId || forceSubmit.isPending}
                onClick={() =>
                  forceSubmit.mutate(sheetId, {
                    onSuccess: () => toast.notify({ title: "Sheet force submitted", detail: "Manager review lane is ready." })
                  })
                }
              >
                <RefreshCcw size={15} />
                Force Submit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Insights</CardTitle>
            <ShieldCheck className="text-cyan-200" size={18} />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {adminInsights.map((insight) => (
              <div key={insight} className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
                {insight}
              </div>
            ))}
            {isLoading ? <div className="h-20 animate-pulse rounded-md bg-white/[0.04]" /> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Escalation Engine</CardTitle>
          <RadioTower className="text-cyan-200" size={18} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.rules ?? []).map((rule) => (
            <div key={rule.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{rule.trigger_type.replaceAll("_", " ")}</div>
                <Badge tone={rule.is_active ? "emerald" : "slate"}>{rule.notify_level}</Badge>
              </div>
              <div className="mt-2 text-sm text-slate-400">Threshold: {rule.threshold_days} days</div>
            </div>
          ))}
          {!(data?.rules ?? []).length ? <div className="text-sm text-slate-400">No escalation rules configured yet.</div> : null}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Escalation Events</CardTitle>
          <AlertTriangle className="text-amber-200" size={18} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.events ?? []).map((event) => (
            <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <Badge tone={event.status === "open" ? "amber" : "emerald"}>{event.status}</Badge>
                <span className="text-xs text-slate-500">{relativeTime(event.fired_at)}</span>
              </div>
              <div className="mt-2 text-sm text-slate-300">Target: {event.target_user_id.slice(0, 8)}</div>
            </div>
          ))}
          {!(data?.events ?? []).length ? <div className="text-sm text-slate-400">No open escalation events.</div> : null}
        </CardContent>
      </Card>

      <AuditExplorer />
    </>
  );
}
