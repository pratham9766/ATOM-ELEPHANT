"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoRoleLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import type { ApiRole } from "@/types/api";

export function RoleGate({
  allow,
  children,
  title = "Role access required"
}: {
  allow: ApiRole[];
  children: React.ReactNode;
  title?: string;
}) {
  const user = useAuthStore((state) => state.user);
  const demoLogin = useDemoRoleLogin();
  const hasAccess = user?.role ? allow.includes(user.role) : true;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-300">
          <ShieldAlert className="text-amber-200" />
          This workspace is available to {allow.join(" / ")} roles.
        </div>
        <div className="flex gap-2">
          {allow.map((role) => (
            <Button key={role} size="sm" onClick={() => demoLogin.mutate(role)}>
              Switch to {role}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
