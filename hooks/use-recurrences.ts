"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { RecorrenciasService } from "@/lib/services/recorrencias.service";
import { useCurrentFamily } from "./use-current-family";

const recorrenciasService = new RecorrenciasService();

export function useRecurrences() {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: queryKeys.recorrencias.lista(familia?.id),
    queryFn: () => recorrenciasService.listarRecorrencias(familia!.id),
    enabled: Boolean(familia?.id),
  });
}
