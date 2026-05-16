"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/types/dashboard";

export function TrendLineChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={156}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "rgba(15, 23, 42, 0.96)",
            border: "1px solid rgba(103, 232, 249, 0.22)",
            borderRadius: 8,
            color: "#e2e8f0"
          }}
        />
        <Area type="monotone" dataKey="forecast" stroke="#6ee7b7" strokeWidth={2} fill="url(#forecast)" />
        <Area type="monotone" dataKey="completed" stroke="#60a5fa" strokeWidth={2} fill="url(#completed)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
