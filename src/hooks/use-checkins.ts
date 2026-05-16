"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkinsService } from "@/services/checkins-service";
import type { CheckinUpsertRequest } from "@/types/api";

export function useSaveCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckinUpsertRequest) => checkinsService.upsert(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
