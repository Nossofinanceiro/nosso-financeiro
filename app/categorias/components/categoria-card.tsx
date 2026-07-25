"use client";

import * as React from "react";
import { Categoria } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Power, PowerOff, Tag } from "lucide-react";
import * as Icons from "lucide-react";

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onToggleStatus: (categoria: Categoria) => void;
}

export function CategoriaCard({ categoria, onEdit, onToggleStatus }: CategoriaCardProps) {
  const isAtiva = categoria.ativa;

  // Resolve dynamic icon if it exists in lucide-react
  let Icon: React.ElementType = Tag;
  if (categoria.icone) {
    const iconName = categoria.icone.charAt(0).toUpperCase() + categoria.icone.slice(1).replace(/-./g, x => x[1].toUpperCase());
    const iconMap = Icons as unknown as Record<string, React.ElementType>;
    const DynamicIcon = iconMap[iconName];
    if (DynamicIcon) {
      Icon = DynamicIcon;
    }
  }

  const typeLabel = categoria.tipo === "receita" ? "Receita" : "Despesa";

  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 hover:border-emerald-500/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div 
          className={`p-3 rounded-xl flex items-center justify-center`}
          style={{ 
            backgroundColor: isAtiva ? (categoria.cor ? `${categoria.cor}20` : 'rgba(16, 185, 129, 0.1)') : 'rgba(30, 41, 59, 1)',
            color: isAtiva ? (categoria.cor || '#34d399') : '#64748b'
          }}
        >
          <Icon className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className={`font-semibold text-lg ${!isAtiva && 'text-slate-400'}`}>
            {categoria.nome}
            {categoria.categoria_sistema && (
              <Badge variant="neutral" className="ml-2 text-[10px] py-0">Sistema</Badge>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-400">{typeLabel}</span>
            <span className="text-slate-600">•</span>
            {isAtiva ? (
              <Badge variant="success" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 text-xs py-0">Ativa</Badge>
            ) : (
              <Badge variant="neutral" className="bg-slate-800 text-slate-400 border-slate-700 text-xs py-0">Inativa</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center w-full sm:w-auto justify-end mt-2 sm:mt-0">
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          }
          items={[
            {
              label: "Editar",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => onEdit(categoria),
            },
            {
              label: isAtiva ? "Inativar" : "Ativar",
              icon: isAtiva ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />,
              danger: isAtiva,
              onClick: () => onToggleStatus(categoria),
            },
          ]}
        />
      </div>
    </Card>
  );
}
