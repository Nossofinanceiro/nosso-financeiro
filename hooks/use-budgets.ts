"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { OrcamentosService } from "@/lib/services/orcamentos.service";
import { useCurrentFamily } from "./use-current-family";

const orcamentosService = new OrcamentosService();

export function useBudgets(mesReferencia?: string) {
  const { data: familia } = useCurrentFamily();
  const mes = mesReferencia || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: queryKeys.orcamentos.mes(familia?.id, mes),
    queryFn: () => orcamentosService.listarOrcamentosPorMes(familia!.id, mes),
    enabled: Boolean(familia?.id),
  });
}
