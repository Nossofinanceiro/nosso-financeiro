"use client";

import * as React from "react";
import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Popover } from "./popover";
import { cn } from "@/lib/utils";

export interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: React.ReactNode;
  className?: string;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  extraActions,
  className,
}: TableActionsProps) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {extraActions}

      {onView && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title="Visualizar detalhes"
          aria-label="Visualizar"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Editar registro"
          aria-label="Editar"
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {onDelete && (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover
            align="right"
            trigger={
              <button
                type="button"
                title="Excluir registro"
                aria-label="Excluir"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            }
            content={
              <div className="space-y-3 w-56 text-left">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Excluir este registro?</span>
                </div>
                <p className="text-xs text-gray-400">
                  Esta ação excluirá o item permanentemente.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete()}
                    className="w-full h-7 text-xs"
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
