"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { MetasService } from "@/lib/services/metas.service";
import { useCurrentFamily } from "./use-current-family";

const metasService = new MetasService();

export function useGoals() {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: queryKeys.metas.lista(familia?.id),
    queryFn: () => metasService.listarMetas(familia!.id),
    enabled: Boolean(familia?.id),
  });
}
