"use client";

import * as React from "react";
import { Conta } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash, Wallet, PiggyBank, Banknote, Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ContaCardProps {
  conta: Conta;
  onEdit: (conta: Conta) => void;
  onDelete: (conta: Conta) => void;
}

export function ContaCard({ conta, onEdit, onDelete }: ContaCardProps) {
  const isAtiva = conta.ativa;

  // Determine Icon and Label based on Type
  let Icon = Wallet;
  let typeLabel = "Conta Corrente";

  switch (conta.tipo) {
    case "corrente":
      Icon = Landmark;
      typeLabel = "Checking";
      break;
    case "poupanca":
      Icon = PiggyBank;
      typeLabel = "Savings";
      break;
    case "dinheiro":
      Icon = Banknote;
      typeLabel = "Cash";
      break;
    case "outra":
      Icon = Wallet;
      typeLabel = "Outros";
      break;
  }

  const saldoExibir = conta.saldo_atual !== undefined ? conta.saldo_atual : conta.saldo_inicial;

  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 hover:border-primary/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl flex items-center justify-center ${isAtiva ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className={`font-semibold text-lg ${!isAtiva && 'text-slate-400'}`}>{conta.nome}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-400">{typeLabel}</span>
            <span className="text-slate-600">•</span>
            {isAtiva ? (
              <Badge variant="success" className="bg-primary/5 text-primary border-primary/20 text-xs py-0">Ativa</Badge>
            ) : (
              <Badge variant="neutral" className="bg-slate-800 text-slate-400 border-slate-700 text-xs py-0">Inativa</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400 mb-1">Saldo Atual</p>
          <p className={`text-lg font-medium ${saldoExibir >= 0 ? 'text-foreground' : 'text-danger'} ${!isAtiva && 'text-slate-400'}`}>
            {formatCurrency(saldoExibir)}
          </p>
        </div>

        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-foreground">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          }
          items={[
            {
              label: "Editar",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => onEdit(conta),
            },
            {
              label: "Excluir",
              icon: <Trash className="w-4 h-4" />,
              danger: true,
              onClick: () => onDelete(conta),
            },
          ]}
        />
      </div>
    </Card>
  );
}
