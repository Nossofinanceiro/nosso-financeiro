"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Despesa } from "@/lib/schemas";
import { Calendar } from "lucide-react";

export interface UpcomingExpensesListProps {
  expenses: Despesa[];
}

export function UpcomingExpensesList({ expenses }: UpcomingExpensesListProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <SectionCard
        title="Próximas Despesas"
        description="Vencimentos previstos para os próximos dias"
      >
        <EmptyState
          title="Nenhuma despesa cadastrada"
          description="Você não possui despesas pendentes de pagamento no momento."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Próximas Despesas"
      description="Vencimentos previstos para os próximos dias"
    >
      <div className="space-y-3">
        {expenses.map((expense) => {
          const isLate = expense.status === "atrasada" || (expense.data_vencimento ? new Date(expense.data_vencimento) < new Date() : false);
          return (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-background/40 border border-border/60 hover:bg-surface-secondary/30 transition-colors"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <p className="text-sm font-semibold text-foreground truncate">
                  {expense.descricao}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>Vence em {expense.data_vencimento || `Dia ${expense.dia_vencimento}`}</span>
                  {isLate && (
                    <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                      Atrasada
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-bold text-danger">
                  {formatCurrency(expense.valor_previsto)}
                </span>
                <p className="text-[11px] text-amber-400 font-medium">Pendente</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
