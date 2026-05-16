import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "cyan",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "cyan" | "emerald" | "amber" | "rose" | "slate" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "cyan" && "border-cyan-300/30 bg-cyan-400/12 text-cyan-100",
        tone === "emerald" && "border-emerald-300/25 bg-emerald-400/12 text-emerald-100",
        tone === "amber" && "border-amber-300/25 bg-amber-400/12 text-amber-100",
        tone === "rose" && "border-rose-300/25 bg-rose-400/12 text-rose-100",
        tone === "slate" && "border-slate-300/15 bg-slate-300/[0.08] text-slate-200",
        className
      )}
      {...props}
    />
  );
}
