import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  CheckCircle2, 
  XCircle,
  Clock
} from "lucide-react";
import { Despesa } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DespesaCardProps {
  despesa: Despesa;
  onEdit: (despesa: Despesa) => void;
  onMarkAsPaid: (despesa: Despesa) => void;
  onCancel: (despesa: Despesa) => void;
  onReactivate: (despesa: Despesa) => void;
}

export function DespesaCard({ 
  despesa, 
  onEdit, 
  onMarkAsPaid, 
  onCancel,
  onReactivate
}: DespesaCardProps) {
  // @ts-expect-error - Joined property from Supabase
  const categoria = despesa.categorias;
  // @ts-expect-error - Joined property from Supabase
  const conta = despesa.contas;

  const isPaga = despesa.status === "paga";
  const isCancelada = despesa.status === "cancelada";
  const isPendente = despesa.status === "pendente" || despesa.status === "atrasada";

  const valorExibicao = isPaga ? (despesa.valor_pago || despesa.valor_previsto) : despesa.valor_previsto;

  return (
    <div className={`bg-slate-900 border ${isCancelada ? 'border-slate-800 opacity-60' : 'border-slate-800'} rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700 group`}>
      
      <div className="flex items-center gap-4">
        {/* Ícone */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
          style={{ 
            backgroundColor: isCancelada ? '#1e293b' : (categoria?.cor ? `${categoria.cor}15` : '#334155'),
            color: isCancelada ? '#64748b' : (categoria?.cor || '#94a3b8')
          }}
        >
          {/* Aqui poderia usar os icones mapeados em lucide, mas por agora um placeholder de tag */}
          <div className="text-xl">🏷️</div>
        </div>

        {/* Detalhes */}
        <div>
          <h3 className={`font-semibold ${isCancelada ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {despesa.descricao}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
            <span className="text-slate-400">
              {categoria?.nome || 'Sem Categoria'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {conta?.nome || 'Sem Conta'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {despesa.data_vencimento ? format(new Date(despesa.data_vencimento), "dd 'de' MMM", { locale: ptBR }) : 'Sem data'}
            </span>

            {isPendente && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
                Pendente
              </span>
            )}
            
            {isPaga && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                Paga
              </span>
            )}

            {isCancelada && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                Cancelada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4">
        {/* Valor */}
        <div className="text-right">
          <p className={`font-bold ${isCancelada ? 'text-slate-500' : 'text-rose-400'}`}>
            -US$ {formatCurrency(valorExibicao || 0).replace("US$", "").trim()}
          </p>
          {isPaga && despesa.data_pagamento && (
            <p className="text-xs text-slate-500">
              Pago em {format(new Date(despesa.data_pagamento), "dd/MM")}
            </p>
          )}
        </div>

        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-foreground p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          items={[
            ...( !isCancelada ? [
              {
                label: "Editar",
                icon: <Pencil className="w-4 h-4" />,
                onClick: () => onEdit(despesa),
              }
            ] : []),
            ...( isPendente && !isCancelada ? [
              {
                label: "Marcar como Paga",
                icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
                onClick: () => onMarkAsPaid(despesa),
              }
            ] : []),
            ...( isPaga && !isCancelada ? [
              {
                label: "Marcar como Pendente",
                icon: <Clock className="w-4 h-4 text-amber-400" />,
                onClick: () => onReactivate(despesa),
              }
            ] : []),
            ...( !isCancelada ? [
              {
                label: "Cancelar Despesa",
                icon: <Trash className="w-4 h-4" />,
                danger: true,
                onClick: () => onCancel(despesa),
              }
            ] : []),
            ...( isCancelada ? [
              {
                label: "Reativar Despesa",
                icon: <XCircle className="w-4 h-4" />,
                onClick: () => onReactivate(despesa),
              }
            ] : [])
          ]}
        />
      </div>
    </div>
  );
}
