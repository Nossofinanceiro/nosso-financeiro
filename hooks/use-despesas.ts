import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DespesasService } from "@/lib/services/despesas.service";
import { queryKeys } from "@/lib/query/query-keys";
import { useCurrentFamily } from "./use-current-family";
import { Despesa } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";

const despesasService = new DespesasService();

export function useDespesas(mesReferencia?: string) {
  const { data: familia } = useCurrentFamily();
  // Se não passar mês, não passamos nada para o service, que assume o mês atual
  const mes = mesReferencia || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: queryKeys.despesas.mes(familia?.id, mes),
    queryFn: () => despesasService.listarDespesas(mes),
    enabled: Boolean(familia?.id),
  });
}

export function useDespesasPendentes() {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: queryKeys.despesas.pendentes(familia?.id),
    // Reutilizando listarDespesas sem filtro de mês se quisermos ou criando um método novo.
    // O backend já tem getDespesasPendentes no repository. Vamos usar isso no service ou fazer o request.
    // Como simplificação, listamos do mês atual. O ideal seria o service expor listarPendentes.
    queryFn: async () => {
      // Importando a instancia do repo dinamicamente para evitar ciclo
      const { DespesasRepository } = await import("@/lib/repositories/despesas.repository");
      const repo = new DespesasRepository();
      const familiaId = await despesasService.getFamiliaId();
      return repo.getDespesasPendentes(familiaId);
    },
    enabled: Boolean(familia?.id),
  });
}

export function useCreateDespesa() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: familia } = useCurrentFamily();

  return useMutation({
    mutationFn: (despesa: Partial<Despesa>) => despesasService.criarDespesa(despesa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despesas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar despesa",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useUpdateDespesa() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Despesa> }) => 
      despesasService.atualizarDespesa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despesas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "error",
      });
    },
  });
}

export function useMarcarDespesaPaga() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, dataPagamento, valorPago, contaId }: { id: string; dataPagamento: string; valorPago: number; contaId: string }) => 
      despesasService.marcarComoPaga(id, dataPagamento, valorPago, contaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despesas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Sucesso",
        description: "Despesa marcada como paga.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar o pagamento.",
        variant: "error",
      });
    },
  });
}
