import { cn, clamp } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-700/70", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all duration-700"
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}
