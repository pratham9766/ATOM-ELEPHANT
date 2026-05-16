"use client";

import { motion } from "framer-motion";
import { Check, LockKeyhole, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "@/types/dashboard";

export function WorkflowVisualization({ nodes }: { nodes: WorkflowNode[] }) {
  return (
    <Card className="min-h-[296px]">
      <CardHeader>
        <CardTitle>Workflow Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex h-[210px] items-center justify-between gap-3">
          <div className="absolute left-8 right-8 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-cyan-300/20 via-cyan-200/50 to-slate-500/20" />
          {nodes.map((node, index) => {
            const Icon = node.state === "locked" ? LockKeyhole : node.state === "active" ? Send : Check;
            return (
              <motion.div
                key={node.label}
                className="relative z-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
              >
                <motion.div
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-full border",
                    node.state === "complete" && "border-cyan-300/35 bg-cyan-300/15 text-cyan-100 shadow-glow",
                    node.state === "active" && "border-emerald-300/35 bg-emerald-300/15 text-emerald-100 shadow-[0_0_26px_rgba(52,211,153,.25)]",
                    node.state === "locked" && "border-slate-500/30 bg-slate-500/12 text-slate-300"
                  )}
                  animate={node.state === "active" ? { y: [0, -4, 0] } : undefined}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  <Icon size={19} />
                </motion.div>
                <div className="w-32 rounded-md border border-white/10 bg-white/[0.055] p-3 text-center">
                  <div className="text-sm font-semibold text-white">{node.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{node.owner}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
