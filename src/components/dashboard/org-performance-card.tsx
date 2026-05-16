"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrgPerformanceCard({ value, confidence }: { value: number; confidence: number }) {
  const circumference = 2 * Math.PI * 74;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Card className="glass-line min-h-[356px]">
      <CardHeader>
        <div>
          <CardTitle className="max-w-[18rem] text-2xl">Organization Performance Intelligence</CardTitle>
          <p className="mt-2 text-sm text-slate-400">AI-weighted completion across goals, check-ins, and audit controls.</p>
        </div>
        <Badge>AI-Augmented</Badge>
      </CardHeader>
      <CardContent className="flex h-[254px] flex-col items-center justify-center">
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(71,85,105,.65)" strokeWidth="18" />
            <motion.circle
              cx="90"
              cy="90"
              r="74"
              fill="none"
              stroke="url(#orgGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="orgGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="52%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <motion.div className="text-5xl font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {value}%
              </motion.div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Complete</div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.9)]" />
          {confidence}% AI confidence
        </div>
      </CardContent>
    </Card>
  );
}
