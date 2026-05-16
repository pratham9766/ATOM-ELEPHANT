"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <motion.div className="min-h-screen overflow-hidden">
      <Sidebar />
      <motion.main
        className={cn(
          "h-screen overflow-y-auto transition-[padding] duration-300 lg:pl-[304px]",
          sidebarCollapsed && "lg:pl-[92px]"
        )}
      >
        <TopNavbar />
        <motion.div className="mx-auto max-w-[1880px] px-4 pb-6 pt-4 lg:px-6">{children}</motion.div>
      </motion.main>
    </motion.div>
  );
}
