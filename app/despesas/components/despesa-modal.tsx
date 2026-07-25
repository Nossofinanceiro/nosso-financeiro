"use client";

import * as React from "react";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Despesa } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useCreateDespesa, useUpdateDespesa } from "@/hooks/use-despesas";
import { useCategorias } from "@/hooks/use-categorias";
import { useContas } from "@/hooks/use-contas";

const formSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  categoria_id: z.string().uuid("Selecione uma categoria"),
  conta_id: z.string().uuid("Selecione uma conta"),
  valor_previsto: z.number().min(0.01, "Valor deve ser maior que zero"),
  data_vencimento: z.string().min(1, "Data é obrigatória"),
  recorrente: z.boolean().default(false),
  observacoes: z.string().optional(),
});

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  despesaToEdit?: Despesa | null;
  selectedMonth: Date;
}

export function DespesaModal({ isOpen, onClose, despesaToEdit, selectedMonth }: DespesaModalProps) {
  const { data: categorias = [] } = useCategorias();
  const { data: contas = [] } = useContas();
  
  const { mutateAsync: createDespesa, isPending: isCreating } = useCreateDespesa();
  const { mutateAsync: updateDespesa, isPending: isUpdating } = useUpdateDespesa();

  // Filtramos as categorias válidas para despesas (tipo 'despesa' ou 'ambos')
  const categoriasDespesa = categorias.filter(c => c.tipo === "despesa" || c.tipo === "ambos");

  const [descricao, setDescricao] = React.useState("");
  const [categoriaId, setCategoriaId] = React.useState("");
  const [contaId, setContaId] = React.useState("");
  const [valorPrevisto, setValorPrevisto] = React.useState("");
  const [dataVencimento, setDataVencimento] = React.useState("");
  const [recorrente, setRecorrente] = React.useState(false);
  const [observacoes, setObservacoes] = React.useState("");
  
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (despesaToEdit) {
        setDescricao(despesaToEdit.descricao);
        setCategoriaId(despesaToEdit.categoria_id || "");
        setContaId(despesaToEdit.conta_id || "");
        setValorPrevisto(despesaToEdit.valor_previsto.toString());
        setDataVencimento(despesaToEdit.data_vencimento || format(new Date(), "yyyy-MM-dd"));
        setRecorrente(despesaToEdit.recorrente ?? false);
        setObservacoes(despesaToEdit.observacoes || "");
      } else {
        setDescricao("");
        setCategoriaId("");
        setContaId("");
        setValorPrevisto("");
        const now = new Date();
        if (now.getMonth() === selectedMonth.getMonth() && now.getFullYear() === selectedMonth.getFullYear()) {
          setDataVencimento(format(now, "yyyy-MM-dd"));
        } else {
          setDataVencimento(format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), "yyyy-MM-dd"));
        }
        setRecorrente(false);
        setObservacoes("");
      }
      setErrors({});
    }
  }, [isOpen, despesaToEdit, selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Parse value to number
    const numValue = parseFloat(valorPrevisto.replace(/[^\d.-]/g, ''));
    
    const formData = {
      descricao,
      categoria_id: categoriaId,
      conta_id: contaId,
      valor_previsto: isNaN(numValue) ? 0 : numValue,
      data_vencimento: dataVencimento,
      recorrente,
      observacoes
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
      const submitData = {
        ...parsed.data,
        mes_referencia: format(new Date(parsed.data.data_vencimento), "yyyy-MM-01"),
      };

      if (despesaToEdit) {
        await updateDespesa({ id: despesaToEdit.id, data: submitData });
      } else {
        await createDespesa(submitData);
      }
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={despesaToEdit ? "Editar Despesa" : "Nova Despesa"}
      description={despesaToEdit ? "Modifique os dados da sua despesa." : "Registre uma nova saída ou previsão."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Descrição *
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex: Conta de Luz"
          />
          {errors.descricao && <p className="text-xs text-red-400 mt-1">{errors.descricao}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Valor Previsto *
            </label>
            <input
              type="number"
              step="0.01"
              value={valorPrevisto}
              onChange={(e) => setValorPrevisto(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0.00"
            />
            {errors.valor_previsto && <p className="text-xs text-red-400 mt-1">{errors.valor_previsto}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Data de Vencimento *
            </label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.data_vencimento && <p className="text-xs text-red-400 mt-1">{errors.data_vencimento}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Categoria *
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione...</option>
              {categoriasDespesa.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.categoria_id && <p className="text-xs text-red-400 mt-1">{errors.categoria_id}</p>}
          </div>

          {/* Conta */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Conta de Saída *
            </label>
            <select
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione...</option>
              {contas.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.conta_id && <p className="text-xs text-red-400 mt-1">{errors.conta_id}</p>}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Observações
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Detalhes adicionais..."
            rows={2}
          />
        </div>

        {/* Recorrente */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recorrente"
            checked={recorrente}
            onChange={(e) => setRecorrente(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
          />
          <label htmlFor="recorrente" className="text-sm font-medium text-slate-300 cursor-pointer">
            Despesa recorrente
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
