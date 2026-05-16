import { apiClient } from "@/lib/api-client";
import type { ApiRole, ApiUser, LoginRequest, TokenPair } from "@/types/api";

export const authService = {
  login: (body: LoginRequest) => apiClient.post<TokenPair>("/auth/login", body, { auth: false }),
  demoLogin: (role: ApiRole) => apiClient.post<TokenPair>("/auth/demo-login", { role }, { auth: false }),
  me: () => apiClient.get<ApiUser>("/auth/me"),
  refresh: (refreshToken: string) =>
    apiClient.post<TokenPair>("/auth/refresh", { refresh_token: refreshToken }, { auth: false })
};
