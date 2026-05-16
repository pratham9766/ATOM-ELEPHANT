import { RoleGate } from "@/components/auth/role-gate";
import { ExecutiveAnalytics } from "@/components/analytics/executive-analytics";

export default function AnalyticsPage() {
  return (
    <RoleGate allow={["manager", "admin"]}>
      <ExecutiveAnalytics />
    </RoleGate>
  );
}
