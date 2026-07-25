"use client";

import * as React from "react";
import * as z from "zod";
import { format } from "date-fns";
import { Receita } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateReceita, useUpdateReceita } from "@/hooks/use-receitas";
import { useCategorias } from "@/hooks/use-categorias";
import { useContas } from "@/hooks/use-contas";

const formSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  categoria_id: z.string().uuid("Selecione uma categoria"),
  conta_id: z.string().uuid("Selecione uma conta"),
  valor_previsto: z.number().min(0.01, "Valor deve ser maior que zero"),
  data_prevista: z.string().min(1, "Data é obrigatória"),
  recorrente: z.boolean().default(false),
  observacoes: z.string().optional(),
});

interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  receitaToEdit?: Receita | null;
  selectedMonth: Date;
}

export function ReceitaModal({ isOpen, onClose, receitaToEdit, selectedMonth }: ReceitaModalProps) {
  const { mutateAsync: createReceita, isPending: isCreating } = useCreateReceita();
  const { mutateAsync: updateReceita, isPending: isUpdating } = useUpdateReceita();
  const { data: categorias = [] } = useCategorias();
  const { data: contas = [] } = useContas();
  
  const isPending = isCreating || isUpdating;
  
  const categoriasReceita = categorias.filter(c => c.tipo === "receita" || c.tipo === "ambos");

  const [descricao, setDescricao] = React.useState("");
  const [categoriaId, setCategoriaId] = React.useState("");
  const [contaId, setContaId] = React.useState("");
  const [valorPrevisto, setValorPrevisto] = React.useState("");
  const [dataPrevista, setDataPrevista] = React.useState(format(selectedMonth, "yyyy-MM-dd"));
  const [recorrente, setRecorrente] = React.useState(false);
  const [observacoes, setObservacoes] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (receitaToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDescricao(receitaToEdit.descricao);
        setCategoriaId(receitaToEdit.categoria_id || "");
        setContaId(receitaToEdit.conta_id || "");
        setValorPrevisto(receitaToEdit.valor_previsto?.toString() || "");
        setDataPrevista(receitaToEdit.data_prevista || format(new Date(), "yyyy-MM-dd"));
        setRecorrente(receitaToEdit.recorrente ?? false);
        setObservacoes(receitaToEdit.observacoes || "");
      } else {
        setDescricao("");
        setCategoriaId("");
        setContaId("");
        setValorPrevisto("");
        // Se o mês selecionado não for o mês atual, preenche o primeiro dia do mês. Senão preenche a data atual.
        const now = new Date();
        if (now.getMonth() === selectedMonth.getMonth() && now.getFullYear() === selectedMonth.getFullYear()) {
          setDataPrevista(format(now, "yyyy-MM-dd"));
        } else {
          setDataPrevista(format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), "yyyy-MM-dd"));
        }
        setRecorrente(false);
        setObservacoes("");
      }
      setErrors({});
    }
  }, [isOpen, receitaToEdit, selectedMonth]);

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
      data_prevista: dataPrevista,
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
      // Adicionamos os campos exigidos pela API e banco
      const submitData = {
        ...parsed.data,
        mes_referencia: format(new Date(parsed.data.data_prevista), "yyyy-MM-01"),
        pessoa: "Geral",
      };

      if (receitaToEdit) {
        await updateReceita({ id: receitaToEdit.id, data: submitData });
      } else {
        await createReceita(submitData);
      }
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={receitaToEdit ? "Editar Receita" : "Nova Receita"}
      description={receitaToEdit ? "Altere os dados da receita pendente." : "Registre uma nova entrada ou previsão."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Descrição *</label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Salário, Freelance, Rendimentos..."
            className="bg-slate-900 border-slate-700"
          />
          {errors.descricao && <p className="text-xs text-danger">{errors.descricao}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Valor Previsto *</label>
            <Input
              type="number"
              step="0.01"
              value={valorPrevisto}
              onChange={(e) => setValorPrevisto(e.target.value)}
              placeholder="0,00"
              className="bg-slate-900 border-slate-700"
            />
            {errors.valor_previsto && <p className="text-xs text-danger">{errors.valor_previsto}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Data Prevista *</label>
            <Input
              type="date"
              value={dataPrevista}
              onChange={(e) => setDataPrevista(e.target.value)}
              className="bg-slate-900 border-slate-700"
            />
            {errors.data_prevista && <p className="text-xs text-danger">{errors.data_prevista}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Categoria *</label>
            <Select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              options={[{ value: "", label: "Selecione..." }, ...categoriasReceita.map(c => ({ value: c.id, label: c.nome }))]}
              className="bg-slate-900 border-slate-700"
            />
            {errors.categoria_id && <p className="text-xs text-danger">{errors.categoria_id}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Conta de Destino *</label>
            <Select
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              options={[{ value: "", label: "Selecione..." }, ...contas.map(c => ({ value: c.id, label: c.nome }))]}
              className="bg-slate-900 border-slate-700"
            />
            {errors.conta_id && <p className="text-xs text-danger">{errors.conta_id}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Observações</label>
          <Input
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Detalhes adicionais..."
            className="bg-slate-900 border-slate-700"
          />
        </div>

        <div className="flex items-center pt-2">
          <Checkbox
            id="recorrente"
            checked={recorrente}
            onChange={(e) => setRecorrente(e.target.checked)}
            label="Receita recorrente"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary hover:bg-emerald-700 text-foreground">
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
