"use client";

import { BellRing, CheckCircle2, Clock, RadioTower } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    title: "Goal sheet awaiting approval",
    detail: "Priya Shah submitted 3 goals for FY2026 Enterprise Cycle.",
    icon: Clock,
    tone: "amber" as const
  },
  {
    title: "Escalation rule armed",
    detail: "Day 7 manager approval SLA is active for the current cycle.",
    icon: RadioTower,
    tone: "cyan" as const
  },
  {
    title: "Audit stream healthy",
    detail: "Workflow events are being captured with actor and before/after state.",
    icon: CheckCircle2,
    tone: "emerald" as const
  }
];

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Enterprise workflow reminders, SLA alerts, and system events." />
      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <BellRing className="text-cyan-200" size={18} />
        </CardHeader>
        <CardContent className="grid gap-3">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4">
                <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
                  <Icon size={18} className="text-cyan-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{item.detail}</div>
                </div>
                <Badge tone={item.tone}>active</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
