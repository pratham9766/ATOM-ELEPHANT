"use client";

import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { PortalShell } from "@/components/layout/portal-shell";

/** @deprecated Use route layout + DashboardHome. Kept for backwards compatibility. */
export function DashboardShell() {
  return (
    <PortalShell>
      <DashboardHome />
    </PortalShell>
  );
}
