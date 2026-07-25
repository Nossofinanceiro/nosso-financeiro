"use client";

import * as React from "react";
import { Categoria } from "@/lib/schemas";
import { CategoriaCard } from "./categoria-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriasListProps {
  categorias: Categoria[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onEdit: (categoria: Categoria) => void;
  onToggleStatus: (categoria: Categoria) => void;
  onCreateNew: () => void;
}

export function CategoriasList({
  categorias,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onToggleStatus,
  onCreateNew
}: CategoriasListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[90px] rounded-xl bg-surface-secondary/50 border border-border" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface/50 border border-danger/20 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger mb-2">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-foreground">Erro ao carregar categorias</h3>
          <p className="text-sm text-muted mt-1 mb-6">
            {error?.message || "Ocorreu um erro inesperado ao buscar os dados. Tente novamente."}
          </p>
          <Button variant="secondary" onClick={onRetry} className="border-border-subtle text-foreground hover:bg-surface-secondary">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface/30 border border-border/50 border-dashed rounded-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-surface-secondary/50 rounded-full flex items-center justify-center text-muted mb-2">
          <PlusCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Nenhuma categoria cadastrada.</h3>
          <p className="text-sm text-muted mt-1 mb-6 max-w-sm">
            Crie categorias para classificar suas despesas e receitas.
          </p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-foreground">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar primeira categoria
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categorias.map((categoria) => (
        <CategoriaCard
          key={categoria.id}
          categoria={categoria}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
