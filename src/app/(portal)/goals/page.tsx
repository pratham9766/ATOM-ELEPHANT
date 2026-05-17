import { RoleGate } from "@/components/auth/role-gate";
import { GoalWorkspace } from "@/components/goals/goal-workspace";

export default function GoalsPage() {
  return (
    <RoleGate allow={["employee"]}>
      <GoalWorkspace />
    </RoleGate>
  );
}
