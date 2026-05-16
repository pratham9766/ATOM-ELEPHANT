import { cn } from "@/lib/utils";

export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <div
      aria-label={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-cyan-200/25 via-slate-300/12 to-emerald-200/20 text-[11px] font-semibold text-white shadow-[0_0_16px_rgba(103,232,249,0.18)]",
        className
      )}
    >
      {label}
    </div>
  );
}
