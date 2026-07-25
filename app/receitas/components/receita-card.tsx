"use client";

import * as React from "react";
import { Receita } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Edit, CheckCircle2, XCircle, RotateCcw, Tag } from "lucide-react";
import * as Icons from "lucide-react";

interface ReceitaCardProps {
  receita: Receita;
  onEdit: (receita: Receita) => void;
  onMarkAsReceived: (receita: Receita) => void;
  onCancel: (receita: Receita) => void;
  onReactivate: (receita: Receita) => void;
}

export function ReceitaCard({ receita, onEdit, onMarkAsReceived, onCancel, onReactivate }: ReceitaCardProps) {
  // @ts-expect-error - Joined property from Supabase
  const categoria = receita.categorias;
  // @ts-expect-error - Joined property from Supabase
  const conta = receita.contas;

  let Icon: React.ElementType = Tag;
  if (categoria?.icone) {
    const iconName = categoria.icone.charAt(0).toUpperCase() + categoria.icone.slice(1).replace(/-./g, (x: string) => x[1].toUpperCase());
    const iconMap = Icons as unknown as Record<string, React.ElementType>;
    const DynamicIcon = iconMap[iconName];
    if (DynamicIcon) {
      Icon = DynamicIcon;
    }
  }

  const statusColor = {
    pendente: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    recebida: "bg-primary/10 text-primary border-primary/20",
    cancelada: "bg-slate-800 text-slate-400 border-slate-700",
  }[receita.status] || "bg-slate-800 text-slate-400 border-slate-700";

  const statusLabel = {
    pendente: "Pendente",
    recebida: "Recebida",
    cancelada: "Cancelada",
  }[receita.status] || receita.status;

  const dataExibicao = receita.status === "recebida" && receita.data_recebimento 
    ? receita.data_recebimento 
    : receita.data_prevista;

  const dataFormatada = dataExibicao ? format(new Date(dataExibicao), "dd 'de' MMM", { locale: ptBR }) : "--";
  const valorExibicao = receita.status === "recebida" ? (receita.valor_recebido || receita.valor_previsto) : receita.valor_previsto;

  return (
    <Card className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 transition-colors group ${receita.status === 'cancelada' ? 'opacity-60' : 'hover:border-primary/30'}`}>
      <div className="flex items-center gap-4">
        <div 
          className="p-3 rounded-xl flex items-center justify-center shrink-0"
          style={{ 
            backgroundColor: receita.status !== 'cancelada' ? (categoria?.cor ? `${categoria.cor}20` : 'rgba(16, 185, 129, 0.1)') : 'rgba(30, 41, 59, 1)',
            color: receita.status !== 'cancelada' ? (categoria?.cor || '#34d399') : '#64748b'
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        
        <div>
          <h3 className={`font-medium ${receita.status === 'cancelada' ? 'text-slate-400 line-through' : 'text-foreground'}`}>
            {receita.descricao}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{categoria?.nome || "Sem categoria"}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{conta?.nome || "Sem conta"}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{dataFormatada}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <Badge variant="neutral" className={`${statusColor} text-[10px] py-0 px-1.5 h-4 hidden sm:inline-flex`}>
              {statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
        <Badge variant="neutral" className={`${statusColor} text-[10px] py-0 px-1.5 h-4 sm:hidden`}>
          {statusLabel}
        </Badge>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-sm font-semibold ${receita.status === 'recebida' ? 'text-primary' : receita.status === 'cancelada' ? 'text-slate-400' : 'text-foreground'}`}>
              {formatCurrency(valorExibicao || 0)}
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
              ...(receita.status === "pendente" ? [
                {
                  label: "Marcar como Recebida",
                  icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
                  onClick: () => onMarkAsReceived(receita),
                },
                {
                  label: "Editar",
                  icon: <Edit className="w-4 h-4" />,
                  onClick: () => onEdit(receita),
                }
              ] : []),
              ...(receita.status === "cancelada" ? [
                {
                  label: "Reativar Receita",
                  icon: <RotateCcw className="w-4 h-4" />,
                  onClick: () => onReactivate(receita),
                }
              ] : []),
              ...(receita.status !== "cancelada" ? [
                {
                  label: "Cancelar",
                  icon: <XCircle className="w-4 h-4" />,
                  danger: true,
                  onClick: () => onCancel(receita),
                }
              ] : [])
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
