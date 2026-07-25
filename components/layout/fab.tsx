"use client";

import * as React from "react";
import { Plus, X, ShieldCheck } from "lucide-react";
import { FAB_ACTIONS } from "@/constants";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Fab() {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeModalAction, setActiveModalAction] = React.useState<string | null>(null);

  const handleActionClick = (action: typeof FAB_ACTIONS[number]) => {
    setMenuOpen(false);
    setActiveModalAction(action.label);
    toast({
      title: `Ação Selecionada: ${action.label}`,
      description: "Infraestrutura pronta. Formulário de lançamento em desenvolvimento.",
      variant: "info",
    });
  };

  return (
    <>
      {/* Menu suspenso do FAB no mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative w-full bg-surface border-t border-border rounded-t-3xl shadow-2xl z-10 overflow-hidden p-4 space-y-3 animate-in slide-in-from-bottom duration-200 pb-safe">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-sm font-bold text-foreground">Nova Transação Rápida</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {FAB_ACTIONS.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleActionClick(act)}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-background/60 border border-border hover:border-primary/40 hover:bg-surface-secondary/60 transition-all touch-target cursor-pointer group text-center space-y-1.5"
                  >
                    <div className={cn("p-2 rounded-xl bg-surface border border-border group-hover:scale-110 transition-transform", act.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-foreground">
                      {act.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) - Visível em telas menores que md (< 768px) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Adicionar lançamento rápido"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary text-foreground shadow-2xl flex items-center justify-center border border-emerald-400/40 active:scale-95 transition-all cursor-pointer touch-target"
        >
          <Plus className={cn("w-7 h-7 transition-transform duration-200", menuOpen && "rotate-45")} />
        </button>
      </div>

      {/* Modal informativo ao acionar o FAB */}
      <Modal
        isOpen={Boolean(activeModalAction)}
        onClose={() => setActiveModalAction(null)}
        title={activeModalAction || "Ação Rápida"}
        description="Módulo visual preparado para o lançamento financeiro."
        footer={
          <Button onClick={() => setActiveModalAction(null)}>
            Entendido
          </Button>
        }
      >
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-emerald-300 text-sm flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 shrink-0 text-primary" />
          <span>
            A infraestrutura visual de <strong>{activeModalAction}</strong> está totalmente pronta para a integração das regras de negócio financeiras.
          </span>
        </div>
      </Modal>
    </>
  );
}
