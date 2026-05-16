import { apiClient } from "@/lib/api-client";
import type { ApiCheckin, CheckinUpsertRequest } from "@/types/api";

export const checkinsService = {
  upsert: (body: CheckinUpsertRequest) => apiClient.post<ApiCheckin>("/checkins", body)
};
