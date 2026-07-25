"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

export interface CategoryExpense {
  categoria_id: string;
  nome: string;
  cor?: string;
  total: number;
}

export interface ExpensesCategoryChartProps {
  categories: CategoryExpense[];
}

export function ExpensesCategoryChart({ categories }: ExpensesCategoryChartProps) {
  const totalSpend = React.useMemo(() => {
    return categories.reduce((acc, c) => acc + c.total, 0);
  }, [categories]);

  if (!categories || categories.length === 0 || totalSpend === 0) {
    return (
      <SectionCard
        title="Gastos por Categoria"
        description="Distribuição percentual das despesas no mês"
      >
        <EmptyState
          title="Nenhum gasto por categoria registrado"
          description="Os lançamentos das suas despesas categorizadas aparecerão aqui em forma de gráfico resumido."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Gastos por Categoria"
      description="Distribuição percentual das despesas no mês"
    >
      <div className="space-y-4">
        {categories.map((cat) => {
          const percentage = totalSpend > 0 ? Math.round((cat.total / totalSpend) * 100) : 0;
          const barColor = cat.cor || "#10b981";

          return (
            <div key={cat.categoria_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="font-medium text-white">{cat.nome}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-xs">{percentage}%</span>
                  <span className="font-mono font-bold text-red-400">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-gray-950/80 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(2, percentage))}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
