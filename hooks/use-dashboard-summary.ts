"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { DashboardService } from "@/lib/services/dashboard.service";

const dashboardService = new DashboardService();

export function useDashboardSummary(mesReferencia?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.resumo(mesReferencia),
    queryFn: () => dashboardService.getDashboardConsolidado(mesReferencia),
  });
}
