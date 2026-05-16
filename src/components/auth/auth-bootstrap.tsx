"use client";

import { useCurrentUser, useDemoRoleLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const demoRole = useAuthStore((state) => state.demoRole);
  const demoLogin = useDemoRoleLogin();
  const { isPending, mutate } = demoLogin;
  useCurrentUser();

  useEffect(() => {
    if (!accessToken && pathname !== "/login" && !isPending) {
      mutate(demoRole);
    }
  }, [accessToken, demoRole, isPending, mutate, pathname]);

  return <>{children}</>;
}
