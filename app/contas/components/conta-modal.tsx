"use client";

import * as React from "react";
import * as z from "zod";
import { Conta } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateConta, useUpdateConta } from "@/hooks/use-contas";
import { CurrencyInput } from "@/components/ui/currency-input";

const formSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  tipo: z.string().min(1, "Tipo obrigatório"),
  saldo_inicial: z.number().min(0, "Saldo deve ser maior ou igual a 0"),
  ativa: z.boolean().default(true),
});

// type FormValues = z.infer<typeof formSchema>;

interface ContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  contaToEdit?: Conta | null;
}

export function ContaModal({ isOpen, onClose, contaToEdit }: ContaModalProps) {
  const { mutateAsync: createConta, isPending: isCreating } = useCreateConta();
  const { mutateAsync: updateConta, isPending: isUpdating } = useUpdateConta();
  const isPending = isCreating || isUpdating;

  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState("corrente");
  const [saldoInicial, setSaldoInicial] = React.useState(0);
  const [ativa, setAtiva] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (contaToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNome(contaToEdit.nome);
        setTipo(contaToEdit.tipo);
        setSaldoInicial(contaToEdit.saldo_inicial);
        setAtiva(contaToEdit.ativa);
      } else {
        setNome("");
        setTipo("corrente");
        setSaldoInicial(0);
        setAtiva(true);
      }
      setErrors({});
    }
  }, [isOpen, contaToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const formData = {
      nome,
      tipo,
      saldo_inicial: saldoInicial,
      ativa,
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
      if (contaToEdit) {
        await updateConta({ id: contaToEdit.id, data: parsed.data });
      } else {
        await createConta(parsed.data);
      }
      onClose();
    } catch (_error) {
      // Error is handled by the hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contaToEdit ? "Editar Conta" : "Nova Conta"}
      description={contaToEdit ? "Altere os dados da conta abaixo." : "Cadastre uma nova conta bancária ou carteira."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Nome *</label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Nubank, Carteira..."
            className="bg-slate-900 border-slate-700"
          />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Tipo *</label>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={[
              { value: "corrente", label: "Checking (Corrente)" },
              { value: "poupanca", label: "Savings (Poupança)" },
              { value: "dinheiro", label: "Cash (Dinheiro)" },
              { value: "outra", label: "Investment/Credit/Outros" },
            ]}
            className="bg-slate-900 border-slate-700"
          />
          {errors.tipo && <p className="text-xs text-red-400">{errors.tipo}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Saldo Inicial *</label>
          <CurrencyInput
            value={saldoInicial}
            onChange={(val) => setSaldoInicial(val)}
            className="bg-slate-900 border-slate-700"
            disabled={!!contaToEdit} // Let's disable for edits if we want to restrict
          />
          {errors.saldo_inicial && <p className="text-xs text-red-400">{errors.saldo_inicial}</p>}
        </div>

        <div className="flex items-center pt-2">
          <Checkbox
            id="ativa"
            checked={ativa}
            onChange={(e) => setAtiva(e.target.checked)}
            label="Conta ativa"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
