"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Approval, ApprovalStatus } from "@/types/dashboard";

const toneByStatus: Record<ApprovalStatus, "emerald" | "amber" | "rose"> = {
  Ready: "emerald",
  Pending: "amber",
  Escalated: "rose"
};

export function PendingApprovalsPanel({ approvals }: { approvals: Approval[] }) {
  return (
    <Card className="min-h-[296px] overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Pending Approvals Panel</CardTitle>
          <p className="mt-1 text-sm text-slate-400">Awaiting approval</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.map((approval) => (
          <div key={approval.id} className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.035] p-3">
            <Avatar label={approval.avatar} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{approval.employee}</div>
              <div className="truncate text-xs text-slate-400">{approval.role}</div>
            </div>
            <Badge tone={toneByStatus[approval.status]}>{approval.sla}</Badge>
            <Button size="sm" variant="success">Approve</Button>
            <Button size="sm" variant="outline">Review</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
