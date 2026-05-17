"use client";

import { AlertTriangle, CalendarPlus, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { AuditExplorer } from "@/components/admin/audit-explorer";
import { useAdminOverview } from "@/hooks/use-admin";
import { relativeTime } from "@/lib/time";

export function AdminConsole() {
  const { data } = useAdminOverview();
  const activeCycle = data?.cycles.find((cycle) => cycle.is_active);

  return (
    <>
      <PageHeader
        title="Admin Console"
        description="Cycle governance, audit readiness, escalation oversight, and enterprise controls."
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
                {activeCycle ? "Goal window and Q1-Q4 check-ins configured." : "Create and activate a cycle to open workflows."}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
              <span>{data?.cycles.length ?? 0} cycles</span>
              <span>{data?.users.length ?? 0} users</span>
              <span>{data?.users.filter((user) => user.role === "manager").length ?? 0} managers</span>
            </div>
            <Button className="w-full">Create Cycle</Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Escalation Engine</CardTitle>
            <RadioTower className="text-cyan-200" size={18} />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {(data?.rules ?? []).map((rule) => (
              <div key={rule.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{rule.trigger_type.replaceAll("_", " ")}</div>
                  <Badge tone={rule.is_active ? "emerald" : "slate"}>{rule.notify_level}</Badge>
                </div>
                <div className="mt-2 text-sm text-slate-400">Threshold: {rule.threshold_days} days</div>
              </div>
            ))}
            {!(data?.rules ?? []).length ? (
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                No escalation rules configured yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

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
