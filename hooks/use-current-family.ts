"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { FamiliaService } from "@/lib/services/familia.service";
import { useCurrentUser } from "./use-current-user";

const familiaService = new FamiliaService();

export function useCurrentFamily() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.familia.atual(),
    queryFn: () => familiaService.getFamiliaAtual(user!.id),
    enabled: Boolean(user?.id),
  });
}
