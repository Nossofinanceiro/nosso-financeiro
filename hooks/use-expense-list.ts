"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { DespesasService } from "@/lib/services/despesas.service";
import { useCurrentFamily } from "./use-current-family";

const despesasService = new DespesasService();

export function useExpenseList(mesReferencia?: string) {
  const { data: familia } = useCurrentFamily();
  const mes = mesReferencia || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: queryKeys.despesas.mes(familia?.id, mes),
    queryFn: () => despesasService.listarDespesas(mes),
    enabled: Boolean(familia?.id),
  });
}
