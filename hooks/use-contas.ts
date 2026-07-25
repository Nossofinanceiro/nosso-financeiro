"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAccounts } from "@/lib/query/query-keys";
import { ContasService } from "@/lib/services/contas.service";
import { Conta } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";

const contasService = new ContasService();

export function useContas() {
  return useQuery({
    queryKey: queryKeys.contas.lista(),
    queryFn: () => contasService.listarContas(),
  });
}

export function useCreateConta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">) => {
      return contasService.criarConta(data);
    },
    onSuccess: () => {
      invalidateAccounts(queryClient);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useUpdateConta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">> }) => {
      return contasService.atualizarConta(id, data);
    },
    onSuccess: () => {
      invalidateAccounts(queryClient);
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useDeleteConta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      return contasService.excluirConta(id);
    },
    onSuccess: () => {
      invalidateAccounts(queryClient);
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}
