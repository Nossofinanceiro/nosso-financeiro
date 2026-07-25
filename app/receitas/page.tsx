"use client";

import * as React from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { ReceitasSummary } from "./components/receitas-summary";
import { ReceitasList } from "./components/receitas-list";
import { ReceitaModal } from "./components/receita-modal";
import { RecebimentoModal } from "./components/recebimento-modal";
import { useReceitas, useUpdateReceita } from "@/hooks/use-receitas";
import { Receita } from "@/lib/schemas";

export default function ReceitasPage() {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const formattedMonth = format(selectedMonth, "yyyy-MM-01");
  const monthDisplay = format(selectedMonth, "MMMM yyyy", { locale: ptBR });

  const { data: receitas = [], isLoading, isError, error, refetch } = useReceitas(formattedMonth);
  const { mutateAsync: updateReceita } = useUpdateReceita();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [receitaToEdit, setReceitaToEdit] = React.useState<Receita | null>(null);

  const [isRecebimentoModalOpen, setIsRecebimentoModalOpen] = React.useState(false);
  const [receitaToReceive, setReceitaToReceive] = React.useState<Receita | null>(null);

  const handlePreviousMonth = () => setSelectedMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));

  const handleCreateNew = () => {
    setReceitaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (receita: Receita) => {
    setReceitaToEdit(receita);
    setIsModalOpen(true);
  };

  const handleMarkAsReceived = (receita: Receita) => {
    setReceitaToReceive(receita);
    setIsRecebimentoModalOpen(true);
  };

  const handleCancel = async (receita: Receita) => {
    if (confirm(`Tem certeza que deseja cancelar a receita "${receita.descricao}"?`)) {
      await updateReceita({ id: receita.id, data: { status: "cancelada" } });
    }
  };

  const handleReactivate = async (receita: Receita) => {
    await updateReceita({ id: receita.id, data: { status: "pendente" } });
  };

  return (
    <AppShell>
      <div className="flex flex-col max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Header & Month Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Receitas</h1>
            <p className="text-sm text-muted">Acompanhe entradas previstas e recebidas</p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="h-8 w-8 p-0 text-muted hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center capitalize text-foreground">
                {monthDisplay}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0 text-muted hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              onClick={handleCreateNew}
              className="bg-primary hover:bg-primary/90 text-foreground whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </div>
        </div>

        <ReceitasSummary receitas={receitas} isLoading={isLoading} />

        <ReceitasList 
          receitas={receitas}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          onEdit={handleEdit}
          onMarkAsReceived={handleMarkAsReceived}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
          onCreateNew={handleCreateNew}
        />

        <ReceitaModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          receitaToEdit={receitaToEdit}
          selectedMonth={selectedMonth}
        />

        <RecebimentoModal
          isOpen={isRecebimentoModalOpen}
          onClose={() => setIsRecebimentoModalOpen(false)}
          receita={receitaToReceive}
        />
      </div>
    </AppShell>
  );
}
