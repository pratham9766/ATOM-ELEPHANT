import { RoleGate } from "@/components/auth/role-gate";
import { ReportsWorkspace } from "@/components/reports/reports-workspace";

export default function ReportsPage() {
  return (
    <RoleGate allow={["manager", "admin"]}>
      <ReportsWorkspace />
    </RoleGate>
  );
}
