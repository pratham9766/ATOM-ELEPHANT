import { RoleGate } from "@/components/auth/role-gate";
import { AuditExplorer } from "@/components/admin/audit-explorer";

export default function AuditPage() {
  return (
    <RoleGate allow={["admin"]}>
      <AuditExplorer />
    </RoleGate>
  );
}
