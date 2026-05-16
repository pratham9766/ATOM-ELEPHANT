"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import type { ApiRole, LoginRequest } from "@/types/api";

export function useCurrentUser() {
  const { accessToken, setUser } = useAuthStore();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 60_000
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setSession } = useAuthStore();
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const tokens = await authService.login(body);
      setSession(tokens);
      const user = await authService.me();
      setSession(tokens, user);
      return user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] })
  });
}

export function useDemoRoleLogin() {
  const queryClient = useQueryClient();
  const { setDemoRole, setSession } = useAuthStore();
  return useMutation({
    mutationFn: async (role: ApiRole) => {
      setDemoRole(role);
      const tokens = await authService.demoLogin(role);
      setSession(tokens);
      const user = await authService.me();
      setSession(tokens, user);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  return () => {
    clearSession();
    queryClient.clear();
  };
}
