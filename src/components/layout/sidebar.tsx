"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { ElephantLogo } from "@/components/shared/elephant-logo";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <motion.aside
      className="fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#111720]/95 px-4 py-5 shadow-panel backdrop-blur-xl lg:block"
      animate={{ width: sidebarCollapsed ? 92 : 304 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <ElephantLogo collapsed={sidebarCollapsed} />
          <Button aria-label="Toggle sidebar" size="icon" variant="ghost" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <nav className="mt-9 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;
            return (
              <motion.a
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex h-12 items-center gap-4 rounded-lg border px-4 py-3 text-sm font-medium transition",
                  active
                    ? "border-cyan-300/35 bg-cyan-300/13 text-cyan-100 shadow-glow"
                    : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.055] hover:text-white",
                  sidebarCollapsed && "justify-center px-0"
                )}
                whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active && "text-cyan-200")} />
                <span className={cn("whitespace-nowrap transition", sidebarCollapsed && "hidden")}>{item.label}</span>
              </motion.a>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className={cn("text-xs uppercase tracking-[0.2em] text-slate-500", sidebarCollapsed && "hidden")}>Realtime</div>
          <div className={cn("mt-2 text-sm text-slate-300", sidebarCollapsed && "hidden")}>WebSocket-ready intelligence stream</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
