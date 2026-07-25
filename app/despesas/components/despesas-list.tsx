"use client";

import * as React from "react";
import { Despesa } from "@/lib/schemas";
import { DespesaCard } from "./despesa-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, AlertCircle } from "lucide-react";

interface DespesasListProps {
  despesas: Despesa[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onEdit: (despesa: Despesa) => void;
  onMarkAsPaid: (despesa: Despesa) => void;
  onCancel: (despesa: Despesa) => void;
  onReactivate: (despesa: Despesa) => void;
  onCreateNew: () => void;
}

export function DespesasList({
  despesas,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onMarkAsPaid,
  onCancel,
  onReactivate,
  onCreateNew
}: DespesasListProps) {
  const [filterMode, setFilterMode] = React.useState<"all" | "pendente" | "paga" | "cancelada">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <h3 className="text-lg font-medium text-red-400 mb-1">Erro ao carregar despesas</h3>
        <p className="text-sm text-red-400/80 mb-4 max-w-md">
          {error?.message || "Não foi possível carregar os dados. Verifique sua conexão ou tente novamente."}
        </p>
        <Button onClick={onRetry} variant="secondary" className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const filteredDespesas = despesas.filter((d) => {
    // 1. Filtrar por status
    if (filterMode === "pendente") {
      if (d.status !== "pendente" && d.status !== "atrasada") return false;
    } else if (filterMode === "paga") {
      if (d.status !== "paga") return false;
    } else if (filterMode === "cancelada") {
      if (d.status !== "cancelada") return false;
    } else if (filterMode === "all") {
      // Opcional: Se 'all' não mostrar canceladas, descomente a linha abaixo
      // Se quiser que "todas" mostre todas mesmo as canceladas, deixe assim
      // if (d.status === "cancelada") return false;
    }

    // 2. Filtrar por busca textual
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchDesc = d.descricao.toLowerCase().includes(term);
      // @ts-expect-error - Joined property from Supabase
      const matchCat = d.categorias?.nome?.toLowerCase().includes(term);
      // @ts-expect-error - Joined property from Supabase
      const matchConta = d.contas?.nome?.toLowerCase().includes(term);

      if (!matchDesc && !matchCat && !matchConta) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex gap-2 p-1 bg-slate-950 rounded-lg overflow-x-auto w-full sm:w-auto pb-2 sm:pb-1">
          <Button
            variant={filterMode === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("all")}
            className={filterMode === "all" ? "bg-slate-800" : "text-slate-400"}
          >
            Todas
          </Button>
          <Button
            variant={filterMode === "pendente" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("pendente")}
            className={filterMode === "pendente" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-amber-400"}
          >
            Pendente
          </Button>
          <Button
            variant={filterMode === "paga" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("paga")}
            className={filterMode === "paga" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-emerald-400"}
          >
            Paga
          </Button>
          <Button
            variant={filterMode === "cancelada" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("cancelada")}
            className={filterMode === "cancelada" ? "bg-slate-800 text-slate-400" : "text-slate-400 hover:text-slate-300"}
          >
            Cancelada
          </Button>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-700"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-slate-900 border border-slate-800 rounded-xl" />
          ))
        ) : filteredDespesas.length > 0 ? (
          filteredDespesas.map((despesa, index) => (
            <div key={despesa.id} style={{ zIndex: filteredDespesas.length - index }} className="relative">
              <DespesaCard
                despesa={despesa}
                onEdit={onEdit}
                onMarkAsPaid={onMarkAsPaid}
                onCancel={onCancel}
                onReactivate={onReactivate}
              />
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              {searchTerm 
                ? "Sua busca não retornou nenhum resultado. Tente outros termos." 
                : "Você ainda não possui despesas neste período com este status."}
            </p>
            {!searchTerm && filterMode === "all" && (
              <Button onClick={onCreateNew} className="bg-emerald-600 hover:bg-emerald-700">
                Criar Primeira Despesa
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
