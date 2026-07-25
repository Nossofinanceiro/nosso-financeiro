"use client";

import * as React from "react";
import * as z from "zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useContas } from "@/hooks/use-contas";
import { useCriarTransferencia } from "@/hooks/use-transferencias";

const formSchema = z.object({
  conta_origem_id: z.string().uuid("Conta de origem inválida"),
  conta_destino_id: z.string().uuid("Conta de destino inválida"),
  valor: z.number().min(0.01, "O valor deve ser maior que zero"),
  data_transferencia: z.string().min(10, "Data inválida"),
});

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { data: contas = [] } = useContas();
  const { mutateAsync: criarTransferencia, isPending } = useCriarTransferencia();

  const contasAtivas = contas.filter(c => c.ativa);

  const [contaOrigemId, setContaOrigemId] = React.useState("");
  const [contaDestinoId, setContaDestinoId] = React.useState("");
  const [valor, setValor] = React.useState(0);
  const [dataTransferencia, setDataTransferencia] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [descricao, setDescricao] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContaOrigemId("");
      setContaDestinoId("");
      setValor(0);
      setDataTransferencia(format(new Date(), "yyyy-MM-dd"));
      setDescricao("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (contaOrigemId === contaDestinoId) {
      setErrors({ conta_destino_id: "Conta de destino deve ser diferente da origem" });
      return;
    }

    try {
      const data = {
        conta_origem_id: contaOrigemId,
        conta_destino_id: contaDestinoId,
        valor,
        data_transferencia: dataTransferencia,
      };

      formSchema.parse(data);

      await criarTransferencia({
        ...data,
        descricao: descricao || null,
      });

      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: "Ocorreu um erro ao salvar." });
      }
    }
  };

  const contasOrigemOptions = contasAtivas.map(c => ({ label: c.nome, value: c.id }));
  const contasDestinoOptions = contasAtivas
    .filter(c => c.id !== contaOrigemId)
    .map(c => ({ label: c.nome, value: c.id }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Transferência"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {errors.form && (
          <div className="p-3 text-sm text-danger bg-danger/10 rounded-md border border-danger/20">
            {errors.form}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Conta de Origem</label>
          <Select
            value={contaOrigemId}
            onChange={(e) => setContaOrigemId(e.target.value)}
            options={[{ label: "Selecione...", value: "" }, ...contasOrigemOptions]}
            error={errors.conta_origem_id}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Conta de Destino</label>
          <Select
            value={contaDestinoId}
            onChange={(e) => setContaDestinoId(e.target.value)}
            options={[{ label: "Selecione...", value: "" }, ...contasDestinoOptions]}
            error={errors.conta_destino_id}
            disabled={isPending || !contaOrigemId}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Valor</label>
            <CurrencyInput
              value={valor}
              onChange={setValor}
              error={errors.valor}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data</label>
            <Input
              type="date"
              value={dataTransferencia}
              onChange={(e) => setDataTransferencia(e.target.value)}
              error={errors.data_transferencia}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Pagamento do empréstimo"
            disabled={isPending}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Transferindo..." : "Transferir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
