"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { RadarMetric } from "@/types/dashboard";

export function OrgHealthRadar({ data }: { data: RadarMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={226}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(148, 163, 184, 0.28)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "#d9e7f5", fontSize: 11 }} />
        <Radar
          name="Org Health"
          dataKey="value"
          stroke="#67e8f9"
          fill="#22d3ee"
          fillOpacity={0.32}
          strokeWidth={2}
          dot={{ r: 3, fill: "#a7f3d0", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
