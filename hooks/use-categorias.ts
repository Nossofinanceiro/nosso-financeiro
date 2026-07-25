"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateCategories } from "@/lib/query/query-keys";
import { CategoriasService } from "@/lib/services/categorias.service";
import { Categoria } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";

const categoriasService = new CategoriasService();

export function useCategorias(familiaId?: string) {
  return useQuery({
    queryKey: queryKeys.categorias.lista(familiaId),
    queryFn: () => categoriasService.listarCategorias(familiaId),
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">) => {
      return categoriasService.criarCategoria(data);
    },
    onSuccess: () => {
      invalidateCategories(queryClient);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">> }) => {
      return categoriasService.atualizarCategoria(id, data);
    },
    onSuccess: (data, variables) => {
      invalidateCategories(queryClient);
      
      const isStatusChange = Object.keys(variables.data).length === 1 && 'ativa' in variables.data;
      
      if (isStatusChange) {
        toast({
          title: "Sucesso",
          description: variables.data.ativa ? "Categoria ativada com sucesso." : "Categoria inativada com sucesso.",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}
