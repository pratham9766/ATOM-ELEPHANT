import { cn } from "@/lib/utils";

export function MetricPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold text-slate-100", tone)}>{value}</div>
    </div>
  );
}
