"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ElephantLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="relative grid h-14 w-14 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-glow"
        animate={{ boxShadow: ["0 0 18px rgba(80,190,255,.22)", "0 0 34px rgba(80,190,255,.38)", "0 0 18px rgba(80,190,255,.22)"] }}
        transition={{ duration: 3.8, repeat: Infinity }}
      >
        <svg viewBox="0 0 72 72" className="h-11 w-11 text-cyan-200" role="img" aria-label="ELEPHANT logo">
          <path
            d="M15 19c9-8 25-8 35 3 7 8 6 19 3 27 5-1 8-3 11-7-1 9-8 15-17 16-13 2-27-6-29-20l-3-19Z"
            fill="currentColor"
            opacity=".16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M16 19c9-7 23-7 32 2 6 7 6 17 4 25 4-1 8-3 11-7-1 10-9 16-19 16-13 0-23-8-25-21"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M50 35c-2 8-3 17 4 20 5 2 9-1 10-6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 29h.1" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <path d="M48 39c6 3 12 2 17-1" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>
      <div className={cn("transition-all", collapsed && "w-0 overflow-hidden opacity-0")}>
        <div className="text-xl font-bold tracking-wide text-white">ELEPHANT</div>
        <div className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Goal Intelligence</div>
      </div>
    </div>
  );
}
