"use client";

import * as React from "react";
import { format } from "date-fns";
import { Receita } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMarcarReceitaRecebida } from "@/hooks/use-receitas";
import { useContas } from "@/hooks/use-contas";

interface RecebimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  receita: Receita | null;
}

export function RecebimentoModal({ isOpen, onClose, receita }: RecebimentoModalProps) {
  const { mutateAsync: marcarRecebida, isPending } = useMarcarReceitaRecebida();
  const { data: contas = [] } = useContas();

  const [valorRecebido, setValorRecebido] = React.useState("");
  const [dataRecebimento, setDataRecebimento] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [contaId, setContaId] = React.useState("");

  React.useEffect(() => {
    if (isOpen && receita) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValorRecebido(receita.valor_previsto?.toString() || "");
      setDataRecebimento(receita.data_prevista || format(new Date(), "yyyy-MM-dd"));
      setContaId(receita.conta_id || "");
    }
  }, [isOpen, receita]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receita) return;

    const numValue = parseFloat(valorRecebido.replace(/[^\d.-]/g, ''));
    if (isNaN(numValue) || numValue <= 0) {
      alert("Valor inválido");
      return;
    }
    
    if (!contaId) {
      alert("Selecione uma conta");
      return;
    }

    try {
      await marcarRecebida({
        id: receita.id,
        valor_recebido: numValue,
        data_recebimento: dataRecebimento,
        conta_id: contaId,
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Marcar como Recebida"
      description="Confirme os detalhes do recebimento desta receita."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Valor Recebido *</label>
          <Input
            type="number"
            step="0.01"
            value={valorRecebido}
            onChange={(e) => setValorRecebido(e.target.value)}
            className="bg-slate-900 border-slate-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Data de Recebimento *</label>
          <Input
            type="date"
            value={dataRecebimento}
            onChange={(e) => setDataRecebimento(e.target.value)}
            className="bg-slate-900 border-slate-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Conta de Destino *</label>
          <Select
            value={contaId}
            onChange={(e) => setContaId(e.target.value)}
            options={[{ value: "", label: "Selecione a conta..." }, ...contas.map((c) => ({ value: c.id, label: c.nome }))]}
            className="bg-slate-900 border-slate-700"
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isPending ? "Confirmando..." : "Confirmar Recebimento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
