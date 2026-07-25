"use client";

import { Card } from "@/components/ui/card";
import { Receita } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Wallet, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReceitasSummaryProps {
  receitas?: Receita[];
  isLoading: boolean;
}

export function ReceitasSummary({ receitas = [], isLoading }: ReceitasSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl bg-surface-secondary/50 border border-border" />
        ))}
      </div>
    );
  }

  // Apenas as não canceladas entram no cálculo principal
  const receitasValidas = receitas.filter(r => r.status !== "cancelada");
  
  const totalPrevisto = receitasValidas.reduce((acc, curr) => acc + (curr.valor_previsto || 0), 0);
  const totalRecebido = receitasValidas.filter(r => r.status === "recebida").reduce((acc, curr) => acc + (curr.valor_recebido || curr.valor_previsto || 0), 0);
  const totalPendente = receitasValidas.filter(r => r.status === "pendente").reduce((acc, curr) => acc + (curr.valor_previsto || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 bg-surface border-border flex flex-col justify-center">
        <div className="flex items-center gap-3 text-muted mb-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Total Previsto</span>
        </div>
        <div className="text-2xl font-bold text-foreground pl-12">
          {formatCurrency(totalPrevisto)}
        </div>
      </Card>

      <Card className="p-4 bg-surface border-border flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 text-muted mb-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Total Recebido</span>
        </div>
        <div className="text-2xl font-bold text-primary pl-12">
          {formatCurrency(totalRecebido)}
        </div>
      </Card>

      <Card className="p-4 bg-surface border-border flex flex-col justify-center">
        <div className="flex items-center gap-3 text-muted mb-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Total Pendente</span>
        </div>
        <div className="text-2xl font-bold text-amber-400 pl-12">
          {formatCurrency(totalPendente)}
        </div>
      </Card>
    </div>
  );
}
