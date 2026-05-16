"use client";

import { Bell, Bot, ChevronDown, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { productCycles, roles } from "@/constants/navigation";
import { useUiStore } from "@/store/ui-store";
import type { UserRole } from "@/types/dashboard";

export function TopNavbar() {
  const { selectedCycle, setCycle, role, setRole } = useUiStore();

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#121821]/80 px-4 py-4 backdrop-blur-xl lg:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[18rem] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.065] pl-12 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/15"
            placeholder="Search goals, employees, audit events..."
          />
        </label>
        <Button variant="ghost" className="h-12 border border-white/[0.08] bg-white/[0.04]">
          <Bot size={18} className="text-cyan-200" />
          AI Insights
        </Button>
        <select
          aria-label="Current cycle selector"
          value={selectedCycle}
          onChange={(event) => setCycle(event.target.value)}
          className="h-12 rounded-lg border border-white/10 bg-[#1a2230] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45"
        >
          {productCycles.map((cycle) => (
            <option key={cycle}>{cycle}</option>
          ))}
        </select>
        <select
          aria-label="Role indicator"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="h-12 rounded-lg border border-white/10 bg-[#1a2230] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45"
        >
          {roles.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Button aria-label="Notifications" size="icon" variant="ghost" className="relative h-12 w-12 border border-white/[0.08] bg-white/[0.04]">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,.9)]" />
        </Button>
        <div className="flex h-12 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] px-3">
          <Avatar label="JD" />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white">JANE DOE | {role.toUpperCase()}</div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck size={12} className="text-cyan-200" />
              Admin / Manager
            </div>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
      <div className="mt-3 flex gap-2 lg:hidden">
        <Badge>ELEPHANT</Badge>
        <Badge tone="slate">Executive dashboard</Badge>
      </div>
    </header>
  );
}
