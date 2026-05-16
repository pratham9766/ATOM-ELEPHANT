import { RoleGate } from "@/components/auth/role-gate";
import { ApprovalWorkspace } from "@/components/manager/approval-workspace";

export default function TeamPage() {
  return (
    <RoleGate allow={["manager", "admin"]}>
      <ApprovalWorkspace />
    </RoleGate>
  );
}
