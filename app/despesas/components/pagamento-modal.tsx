"use client";

import * as React from "react";
import * as z from "zod";
import { format } from "date-fns";
import { Despesa } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useMarcarDespesaPaga } from "@/hooks/use-despesas";
import { useContas } from "@/hooks/use-contas";

const formSchema = z.object({
  valorPago: z.number().min(0.01, "Valor deve ser maior que zero"),
  dataPagamento: z.string().min(1, "Data é obrigatória"),
  contaId: z.string().uuid("Selecione a conta"),
});

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  despesa: Despesa | null;
}

export function PagamentoModal({ isOpen, onClose, despesa }: PagamentoModalProps) {
  const { data: contas = [] } = useContas();
  const { mutateAsync: marcarPaga, isPending } = useMarcarDespesaPaga();

  const [valorPago, setValorPago] = React.useState("");
  const [dataPagamento, setDataPagamento] = React.useState("");
  const [contaId, setContaId] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen && despesa) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValorPago(despesa.valor_previsto.toString());
      setDataPagamento(format(new Date(), "yyyy-MM-dd"));
      setContaId(despesa.conta_id || "");
      setErrors({});
    }
  }, [isOpen, despesa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!despesa) return;
    setErrors({});
    
    const numValue = parseFloat(valorPago.replace(/[^\d.-]/g, ''));
    
    const formData = {
      valorPago: isNaN(numValue) ? 0 : numValue,
      dataPagamento,
      contaId,
    };
    
    const parsed = formSchema.safeParse(formData);
    
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = parsed.error.flatten().fieldErrors;
      for (const key in flattened) {
        if (flattened[key as keyof typeof flattened]?.[0]) {
          fieldErrors[key] = flattened[key as keyof typeof flattened]![0];
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await marcarPaga({
        id: despesa.id,
        dataPagamento: parsed.data.dataPagamento,
        valorPago: parsed.data.valorPago,
        contaId: parsed.data.contaId
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  if (!despesa) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Confirmar Pagamento"
      description={`Confirme os dados do pagamento para "${despesa.descricao}".`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Valor Pago *
            </label>
            <input
              type="number"
              step="0.01"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.valorPago && <p className="text-xs text-danger mt-1">{errors.valorPago}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Data do Pagamento *
            </label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.dataPagamento && <p className="text-xs text-danger mt-1">{errors.dataPagamento}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Conta de Saída *
          </label>
          <select
            value={contaId}
            onChange={(e) => setContaId(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione...</option>
            {contas.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {errors.contaId && <p className="text-xs text-danger mt-1">{errors.contaId}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? "Confirmando..." : "Confirmar Pagamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
