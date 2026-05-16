"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElephantLogo } from "@/components/shared/elephant-logo";
import { useDemoRoleLogin, useLogin } from "@/hooks/use-auth";
import type { ApiRole } from "@/types/api";

const demoRoles: Array<{ role: ApiRole; label: string; detail: string }> = [
  { role: "employee", label: "Employee", detail: "Create goals and submit check-ins" },
  { role: "manager", label: "Manager", detail: "Review approvals and team performance" },
  { role: "admin", label: "Admin", detail: "Audit, cycles, escalations, analytics" }
];

function LoginContent() {
  const searchParams = useSearchParams();
  const login = useLogin();
  const demoLogin = useDemoRoleLogin();
  const next = searchParams.get("next") ?? "/";

  async function handleDemoLogin(role: ApiRole) {
    await demoLogin.mutateAsync(role);
    window.location.href = next;
  }

  async function handlePasswordLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await login.mutateAsync({
      email: String(formData.get("email")),
      password: String(formData.get("password"))
    });
    window.location.href = next;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-[460px]">
        <div className="mb-7 flex justify-center">
          <ElephantLogo />
        </div>
        <Card className="glass-line">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to ELEPHANT</CardTitle>
            <p className="text-sm text-slate-400">Enterprise goal intelligence with demo-ready role switching.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button className="h-12 w-full justify-center" type="button">
              <ShieldCheck size={18} />
              Sign in with Microsoft
            </Button>

            <form className="space-y-3" onSubmit={handlePasswordLogin}>
              <input
                name="email"
                type="email"
                placeholder="name@company.com"
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm outline-none focus:border-cyan-300/40"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm outline-none focus:border-cyan-300/40"
              />
              <Button className="w-full" type="submit" disabled={login.isPending}>
                <LogIn size={16} />
                Continue
              </Button>
            </form>

            <div className="grid gap-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <Bot size={14} />
                Demo role switch
              </div>
              {demoRoles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                >
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.detail}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-slate-300">Loading sign-in...</main>}>
      <LoginContent />
    </Suspense>
  );
}
