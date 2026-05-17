import { RoleGate } from "@/components/auth/role-gate";
import { CheckinWorkspace } from "@/components/checkins/checkin-workspace";

export default function CheckInsPage() {
  return (
    <RoleGate allow={["employee"]}>
      <CheckinWorkspace />
    </RoleGate>
  );
}
