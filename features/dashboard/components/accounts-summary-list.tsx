"use client";

import * as React from "react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Conta } from "@/lib/schemas";
import { Landmark } from "lucide-react";

export interface AccountsSummaryListProps {
  accounts: Conta[];
}

export function AccountsSummaryList({ accounts }: AccountsSummaryListProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <SectionCard
        title="Minhas Contas"
        description="Saldos atualizados de contas bancárias e carteiras"
      >
        <EmptyState
          title="Cadastre sua primeira conta"
          description="Adicione suas contas bancárias ou dinheiro em espécie para acompanhar os saldos em tempo real."
        />
      </SectionCard>
    );
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "corrente":
        return "Conta Corrente";
      case "poupanca":
        return "Poupança";
      case "investimento":
        return "Investimentos";
      case "dinheiro":
        return "Espécie";
      case "carteira_digital":
        return "Carteira Digital";
      default:
        return "Outros";
    }
  };

  return (
    <SectionCard
      title="Minhas Contas"
      description="Saldos atualizados de contas bancárias e carteiras"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((conta) => {
          const saldo = conta.saldo_atual !== undefined ? conta.saldo_atual : conta.saldo_inicial;
          return (
            <div
              key={conta.id}
              className="p-4 rounded-xl bg-background/40 border border-border/60 flex items-center justify-between gap-3 hover:border-border-subtle transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground shrink-0 shadow-md"
                  style={{ backgroundColor: conta.cor || "#10b981" }}
                >
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {conta.nome}
                  </p>
                  <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                    {getTipoLabel(conta.tipo)}
                  </Badge>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-mono font-bold ${
                    saldo >= 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  {formatCurrency(saldo)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
