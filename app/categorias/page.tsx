"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCategorias, useUpdateCategoria } from "@/hooks/use-categorias";
import { Categoria } from "@/lib/schemas";
import { CategoriaModal } from "./components/categoria-modal";
import { CategoriasList } from "./components/categorias-list";
import { Tabs } from "@/components/ui/tabs";

export default function CategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const { mutateAsync: updateCategoria } = useUpdateCategoria();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = React.useState<Categoria | null>(null);
  const [defaultTipo, setDefaultTipo] = React.useState<"receita" | "despesa">("despesa");
  const [activeTab, setActiveTab] = React.useState("despesas");

  const despesas = categorias?.filter((c) => c.tipo === "despesa") || [];
  const receitas = categorias?.filter((c) => c.tipo === "receita") || [];

  const handleOpenModal = (tipo: "receita" | "despesa") => {
    setDefaultTipo(tipo);
    setCategoriaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (categoria: Categoria) => {
    try {
      await updateCategoria({
        id: categoria.id,
        data: { ativa: !categoria.ativa },
      });
    } catch (err) {
      console.error("Erro ao alterar status da categoria", err);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Categorias</h1>
            <p className="text-sm text-slate-400 mt-1">Organize suas receitas e despesas</p>
          </div>
          
          <Button 
            onClick={() => handleOpenModal(activeTab === "receitas" ? "receita" : "despesa")}
            className="bg-primary hover:bg-emerald-700 text-foreground shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <Tabs 
          tabs={[
            { id: "despesas", label: "Despesas", badge: despesas.length },
            { id: "receitas", label: "Receitas", badge: receitas.length }
          ]} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          className="w-full"
        />

        {activeTab === "despesas" && (
          <div className="pt-2">
            <CategoriasList
              categorias={despesas}
              isLoading={isLoading}
              isError={isError}
              error={error as Error}
              onRetry={() => refetch()}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onCreateNew={() => handleOpenModal("despesa")}
            />
          </div>
        )}

        {activeTab === "receitas" && (
          <div className="pt-2">
            <CategoriasList
              categorias={receitas}
              isLoading={isLoading}
              isError={isError}
              error={error as Error}
              onRetry={() => refetch()}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onCreateNew={() => handleOpenModal("receita")}
            />
          </div>
        )}
      </div>

      <CategoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoriaToEdit={categoriaToEdit}
        defaultTipo={defaultTipo}
      />
    </AppShell>
  );
}
