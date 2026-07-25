"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateIncomes } from "@/lib/query/query-keys";
import { ReceitasService } from "@/lib/services/receitas.service";
import { useCurrentFamily } from "./use-current-family";
import { Receita } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";

const receitasService = new ReceitasService();

export function useReceitas(mesReferencia?: string) {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: queryKeys.receitas.mes(familia?.id, mesReferencia),
    queryFn: () => receitasService.listarReceitas(mesReferencia),
    enabled: Boolean(familia?.id),
  });
}

export function useCreateReceita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Receita>) => receitasService.criarReceita(data),
    onSuccess: async () => {
      await invalidateIncomes(queryClient);
      toast({
        title: "Receita criada",
        description: "A receita foi cadastrada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar receita",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useUpdateReceita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Receita> }) =>
      receitasService.atualizarReceita(id, data),
    onSuccess: async () => {
      await invalidateIncomes(queryClient);
      toast({
        title: "Receita atualizada",
        description: "As informações da receita foram salvas com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar receita",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useMarcarReceitaRecebida() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      id, 
      valor_recebido, 
      data_recebimento, 
      conta_id 
    }: { 
      id: string; 
      valor_recebido: number; 
      data_recebimento: string; 
      conta_id: string 
    }) =>
      receitasService.atualizarReceita(id, { 
        status: "recebida", 
        valor_recebido, 
        data_recebimento, 
        conta_id 
      }),
    onSuccess: async () => {
      await invalidateIncomes(queryClient);
      toast({
        title: "Receita recebida",
        description: "Receita marcada como recebida.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao marcar como recebida",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}
