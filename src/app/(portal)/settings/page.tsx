import { RoleGate } from "@/components/auth/role-gate";
import { AdminConsole } from "@/components/admin/admin-console";

export default function SettingsPage() {
  return (
    <RoleGate allow={["admin"]}>
      <AdminConsole />
    </RoleGate>
  );
}
