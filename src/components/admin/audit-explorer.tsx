"use client";

import { FileDown, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { useAuditLogs } from "@/hooks/use-admin";
import { relativeTime } from "@/lib/time";

export function AuditExplorer() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <>
      <PageHeader title="Audit Explorer" description="Filterable enterprise activity stream powered by workflow events." />
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <Button variant="outline" size="sm">
            <FileDown size={15} />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[860px] divide-y divide-white/[0.07]">
              {logs.map((log) => (
                <div key={log.id} className="grid grid-cols-[1fr_1fr_1.4fr_.8fr] items-center gap-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-cyan-200" />
                    <div>
                      <div className="font-semibold text-white">{log.action.replaceAll("_", " ")}</div>
                      <div className="text-xs text-slate-500">{relativeTime(log.timestamp)}</div>
                    </div>
                  </div>
                  <Badge tone="slate">{log.entity_type}</Badge>
                  <div className="truncate text-slate-300">{log.entity_id}</div>
                  <div className="text-slate-400">{log.changed_by?.slice(0, 8) ?? "system"}</div>
                </div>
              ))}
              {isLoading ? <div className="h-32 animate-pulse rounded-md bg-white/[0.04]" /> : null}
              {!logs.length && !isLoading ? (
                <div className="grid min-h-40 place-items-center text-slate-400">
                  No audit events yet. Workflow activity will appear here automatically.
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
