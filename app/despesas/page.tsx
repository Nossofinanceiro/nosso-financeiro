"use client";

import * as React from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { DespesasSummary } from "./components/despesas-summary";
import { DespesasList } from "./components/despesas-list";
import { DespesaModal } from "./components/despesa-modal";
import { PagamentoModal } from "./components/pagamento-modal";
import { useDespesas, useUpdateDespesa } from "@/hooks/use-despesas";
import { Despesa } from "@/lib/schemas";

export default function DespesasPage() {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const formattedMonth = format(selectedMonth, "yyyy-MM-01");
  const monthDisplay = format(selectedMonth, "MMMM yyyy", { locale: ptBR });

  const { data: despesas = [], isLoading, isError, error, refetch } = useDespesas(formattedMonth);
  const { mutateAsync: updateDespesa } = useUpdateDespesa();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [despesaToEdit, setDespesaToEdit] = React.useState<Despesa | null>(null);

  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = React.useState(false);
  const [despesaToPay, setDespesaToPay] = React.useState<Despesa | null>(null);

  const handlePreviousMonth = () => setSelectedMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));

  const handleCreateNew = () => {
    setDespesaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (despesa: Despesa) => {
    setDespesaToEdit(despesa);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = (despesa: Despesa) => {
    setDespesaToPay(despesa);
    setIsPagamentoModalOpen(true);
  };

  const handleCancel = async (despesa: Despesa) => {
    if (confirm(`Tem certeza que deseja cancelar a despesa "${despesa.descricao}"?`)) {
      await updateDespesa({ id: despesa.id, data: { status: "cancelada" } });
    }
  };

  const handleReactivate = async (despesa: Despesa) => {
    await updateDespesa({ id: despesa.id, data: { status: "pendente" } });
  };

  return (
    <AppShell>
      <div className="flex flex-col max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Header & Month Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
            <p className="text-sm text-slate-400">Gerencie suas saídas e contas a pagar</p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="h-8 w-8 p-0 text-slate-400 hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center capitalize text-slate-200">
                {monthDisplay}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0 text-slate-400 hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              onClick={handleCreateNew}
              className="bg-primary hover:bg-emerald-700 text-foreground whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        <DespesasSummary despesas={despesas} isLoading={isLoading} />

        <DespesasList 
          despesas={despesas}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          onEdit={handleEdit}
          onMarkAsPaid={handleMarkAsPaid}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
          onCreateNew={handleCreateNew}
        />

        <DespesaModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          despesaToEdit={despesaToEdit}
          selectedMonth={selectedMonth}
        />

        <PagamentoModal
          isOpen={isPagamentoModalOpen}
          onClose={() => setIsPagamentoModalOpen(false)}
          despesa={despesaToPay}
        />
      </div>
    </AppShell>
  );
}
