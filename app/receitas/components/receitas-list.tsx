"use client";

import * as React from "react";
import { Receita } from "@/lib/schemas";
import { ReceitaCard } from "./receita-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface ReceitasListProps {
  receitas: Receita[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onEdit: (receita: Receita) => void;
  onMarkAsReceived: (receita: Receita) => void;
  onCancel: (receita: Receita) => void;
  onReactivate: (receita: Receita) => void;
  onCreateNew: () => void;
}

export function ReceitasList({
  receitas,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onMarkAsReceived,
  onCancel,
  onReactivate,
  onCreateNew
}: ReceitasListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos"); // "todos", "pendente", "recebida", "cancelada"

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[80px] w-full rounded-xl bg-slate-800/50 border border-slate-800" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-red-500/20 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-white">Erro ao carregar receitas</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            {error?.message || "Ocorreu um erro inesperado ao buscar os dados. Tente novamente."}
          </p>
          <Button variant="secondary" onClick={onRetry} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const filteredReceitas = receitas.filter((receita) => {
    const matchesSearch = receita.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || receita.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
          {["todos", "pendente", "recebida", "cancelada"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              }`}
            >
              {status === "todos" ? "Todas" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-slate-900 border-slate-800 text-sm"
          />
        </div>
      </div>

      {/* List */}
      {filteredReceitas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-2">
            <PlusCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Nenhuma receita encontrada.</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">
              {receitas.length === 0 
                ? "Nenhuma receita cadastrada neste mês." 
                : "Nenhuma receita corresponde aos filtros atuais."}
            </p>
            {receitas.length === 0 && (
              <Button onClick={onCreateNew} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Criar primeira receita
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceitas.map((receita, index) => (
            <div key={receita.id} style={{ zIndex: filteredReceitas.length - index }} className="relative">
              <ReceitaCard
                receita={receita}
                onEdit={onEdit}
                onMarkAsReceived={onMarkAsReceived}
                onCancel={onCancel}
                onReactivate={onReactivate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
