import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AlignmentNode } from "@/types/dashboard";

const toneClass = {
  company: "border-cyan-300/35 bg-cyan-300/12 text-cyan-100",
  team: "border-blue-300/30 bg-blue-300/10 text-blue-100",
  individual: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
};

function TreeNode({ node, depth = 0 }: { node: AlignmentNode; depth?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("rounded-md border px-3 py-2 text-xs font-medium shadow-[0_0_16px_rgba(56,189,248,.13)]", toneClass[node.tone])}>
        {node.label}
      </div>
      {node.children ? (
        <div className="relative flex gap-4 pt-4">
          <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-slate-500/60" />
          {node.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-slate-500/60" />
              <TreeNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function GoalAlignmentTree({ tree }: { tree: AlignmentNode }) {
  return (
    <Card className="min-h-[232px] overflow-hidden">
      <CardHeader>
        <CardTitle>Goal Alignment Tree</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center overflow-x-auto pb-5">
        <TreeNode node={tree} />
      </CardContent>
    </Card>
  );
}
