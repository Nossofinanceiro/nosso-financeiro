import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransferenciasService } from "@/lib/services/transferencias.service";
import { queryKeys } from "@/lib/query/query-keys";
import { useCurrentFamily } from "./use-current-family";
import { Transferencia } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";

const transferenciasService = new TransferenciasService();

export function useTransferencias() {
  const { data: familia } = useCurrentFamily();

  return useQuery({
    queryKey: [...queryKeys.contas.all, "transferencias", familia?.id || ""],
    queryFn: () => transferenciasService.listarTransferencias(),
    enabled: Boolean(familia?.id),
  });
}

export function useCriarTransferencia() {
  const queryClient = useQueryClient();
  const { data: familia } = useCurrentFamily();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (transferencia: Omit<Transferencia, "id" | "familia_id" | "criado_em">) => 
      transferenciasService.criarTransferencia(transferencia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.contas.all, "transferencias", familia?.id || ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Transferência realizada",
        description: "A transferência foi salva com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao transferir",
        description: error.message,
        variant: "error",
      });
    },
  });
}

export function useEditarTransferencia() {
  const queryClient = useQueryClient();
  const { data: familia } = useCurrentFamily();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Transferencia, "id" | "familia_id" | "criado_em">> }) => 
      transferenciasService.atualizarTransferencia(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.contas.all, "transferencias", familia?.id || ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Transferência atualizada",
        description: "As alterações foram salvas com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "error",
      });
    },
  });
}

export function useExcluirTransferencia() {
  const queryClient = useQueryClient();
  const { data: familia } = useCurrentFamily();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => transferenciasService.excluirTransferencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.contas.all, "transferencias", familia?.id || ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast({
        title: "Transferência excluída",
        description: "A transferência foi apagada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "error",
      });
    },
  });
}
