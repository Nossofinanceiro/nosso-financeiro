"use client";

import * as React from "react";
import * as z from "zod";
import { Categoria } from "@/lib/schemas";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateCategoria, useUpdateCategoria } from "@/hooks/use-categorias";

const formSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  tipo: z.enum(["receita", "despesa"]),
  cor: z.string().min(1, "Cor obrigatória"),
  icone: z.string().optional(),
  ativa: z.boolean().default(true),
});

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaToEdit?: Categoria | null;
  defaultTipo?: "receita" | "despesa";
}

export function CategoriaModal({ isOpen, onClose, categoriaToEdit, defaultTipo = "despesa" }: CategoriaModalProps) {
  const { mutateAsync: createCategoria, isPending: isCreating } = useCreateCategoria();
  const { mutateAsync: updateCategoria, isPending: isUpdating } = useUpdateCategoria();
  const isPending = isCreating || isUpdating;

  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState<"receita" | "despesa">(defaultTipo);
  const [cor, setCor] = React.useState("#3B82F6"); // Default blue
  const [icone, setIcone] = React.useState("tag");
  const [ativa, setAtiva] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (categoriaToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNome(categoriaToEdit.nome);
        setTipo(categoriaToEdit.tipo as "receita" | "despesa");
        setCor(categoriaToEdit.cor || "#3B82F6");
        setIcone(categoriaToEdit.icone || "tag");
        setAtiva(categoriaToEdit.ativa ?? true);
      } else {
        setNome("");
        setTipo(defaultTipo);
        setCor("#3B82F6");
        setIcone("tag");
        setAtiva(true);
      }
      setErrors({});
    }
  }, [isOpen, categoriaToEdit, defaultTipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const formData = { nome, tipo, cor, icone, ativa };
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
      if (categoriaToEdit) {
        await updateCategoria({ id: categoriaToEdit.id, data: parsed.data });
      } else {
        await createCategoria(parsed.data);
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
      title={categoriaToEdit ? "Editar Categoria" : "Nova Categoria"}
      description={categoriaToEdit ? "Altere os dados da categoria abaixo." : "Crie uma nova categoria para organizar suas finanças."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Nome *</label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Alimentação, Salário..."
            className="bg-slate-900 border-slate-700"
          />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Tipo *</label>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "receita" | "despesa")}
            options={[
              { value: "despesa", label: "Despesa" },
              { value: "receita", label: "Receita" },
            ]}
            className="bg-slate-900 border-slate-700"
            disabled={!!categoriaToEdit} // Generally good practice to not change type after creation
          />
          {errors.tipo && <p className="text-xs text-red-400">{errors.tipo}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Cor *</label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="w-12 h-10 p-1 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <Input
              type="text"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="flex-1 bg-slate-900 border-slate-700"
              placeholder="#000000"
            />
          </div>
          {errors.cor && <p className="text-xs text-red-400">{errors.cor}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Ícone</label>
          <Input
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            placeholder="Ex: tag, home, shopping-cart..."
            className="bg-slate-900 border-slate-700"
          />
          <p className="text-[10px] text-slate-500">Nome de um ícone Lucide (ex: home, car, coffee)</p>
        </div>

        <div className="flex items-center pt-2">
          <Checkbox
            id="ativa"
            checked={ativa}
            onChange={(e) => setAtiva(e.target.checked)}
            label="Categoria ativa"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
