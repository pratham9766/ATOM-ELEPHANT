"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApiRole, ApiUser, TokenPair } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  demoRole: ApiRole;
  lastLoginAt: string | null;
  setSession: (tokens: TokenPair, user?: ApiUser | null) => void;
  setUser: (user: ApiUser | null) => void;
  setDemoRole: (role: ApiRole) => void;
  clearSession: () => void;
}

function writeTokenCookie(accessToken: string | null) {
  if (typeof document === "undefined") {
    return;
  }
  if (!accessToken) {
    document.cookie = "elephant_access_token=; Max-Age=0; path=/";
    return;
  }
  document.cookie = `elephant_access_token=${accessToken}; path=/; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      demoRole: "admin",
      lastLoginAt: null,
      setSession: (tokens, user) => {
        writeTokenCookie(tokens.access_token);
        set((state) => ({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user: user === undefined ? state.user : user,
          lastLoginAt: new Date().toISOString()
        }));
      },
      setUser: (user) => set({ user }),
      setDemoRole: (demoRole) => set({ demoRole }),
      clearSession: () => {
        writeTokenCookie(null);
        set({ accessToken: null, refreshToken: null, user: null });
      }
    }),
    {
      name: "elephant-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        demoRole: state.demoRole,
        lastLoginAt: state.lastLoginAt
      })
    }
  )
);
