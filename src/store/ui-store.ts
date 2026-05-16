"use client";

import { create } from "zustand";
import type { UserRole } from "@/types/dashboard";

interface UiState {
  sidebarCollapsed: boolean;
  selectedCycle: string;
  role: UserRole;
  toggleSidebar: () => void;
  setCycle: (cycle: string) => void;
  setRole: (role: UserRole) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  selectedCycle: "Q1 2026 Cycle",
  role: "Admin",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCycle: (selectedCycle) => set({ selectedCycle }),
  setRole: (role) => set({ role })
}));
