"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { CartoesService } from "@/lib/services/cartoes.service";
import { useCurrentFamily } from "./use-current-family";

const cartoesService = new CartoesService();

export function useCreditCards() {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: queryKeys.cartoes.lista(familia?.id),
    queryFn: () => cartoesService.listarCartoes(familia!.id),
    enabled: Boolean(familia?.id),
  });
}
