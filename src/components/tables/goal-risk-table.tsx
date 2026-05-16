"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GoalRisk, RiskLevel } from "@/types/dashboard";

const toneByRisk: Record<RiskLevel, "emerald" | "amber" | "rose"> = {
  Low: "emerald",
  Medium: "amber",
  High: "rose"
};

export function GoalRiskTable({ rows }: { rows: GoalRisk[] }) {
  return (
    <Card className="min-h-[356px] overflow-hidden">
      <CardHeader className="border-b border-white/[0.08]">
        <div>
          <CardTitle className="text-2xl">Goal Risk Prediction</CardTitle>
          <p className="mt-1 text-sm text-slate-400">AI Risk Alert: Goals & Individuals</p>
        </div>
        <Badge tone="slate">Q1 2026 Cycle</Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.15fr_1.35fr_.95fr_.82fr_1.3fr] border-b border-white/[0.08] px-4 py-3 text-xs text-slate-400">
            <span>Employee</span>
            <span>Goal</span>
            <span>Progress Bar</span>
            <span>AI Risk Score</span>
            <span>Recommended Action</span>
          </div>
          <div className="divide-y divide-white/[0.07]">
            {rows.map((row, index) => (
              <motion.div
                key={row.id}
                className="grid grid-cols-[1.15fr_1.35fr_.95fr_.82fr_1.3fr] items-center px-4 py-3 text-sm text-slate-200"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="flex items-center gap-3">
                  <Avatar label={row.avatar} />
                  <span className="font-medium text-white">{row.employee}</span>
                </div>
                <span className="truncate pr-4">{row.goal}</span>
                <Progress value={row.progress} />
                <Badge tone={toneByRisk[row.risk]}>{row.risk}</Badge>
                <span className="truncate text-slate-300">{row.recommendation}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
