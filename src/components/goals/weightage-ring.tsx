"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function WeightageRing({ total, message }: { total: number; message: string }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (Math.min(total, 100) / 100) * circumference;
  const tone = total === 100 ? "text-emerald-200" : total > 100 ? "text-rose-200" : "text-cyan-200";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="52" fill="none" stroke="rgba(71,85,105,.65)" strokeWidth="12" />
            <motion.circle
              cx="64"
              cy="64"
              r="52"
              fill="none"
              stroke={total > 100 ? "#fb7185" : total === 100 ? "#6ee7b7" : "#67e8f9"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className={cn("text-3xl font-bold", tone)}>{total}%</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">allocated</div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Enterprise validation</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-white/[0.05] p-2">
              <div className="font-semibold text-white">100%</div>
              <div className="text-slate-500">required</div>
            </div>
            <div className="rounded-md bg-white/[0.05] p-2">
              <div className="font-semibold text-white">10%</div>
              <div className="text-slate-500">minimum</div>
            </div>
            <div className="rounded-md bg-white/[0.05] p-2">
              <div className="font-semibold text-white">8</div>
              <div className="text-slate-500">max goals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
