"use client";

import * as React from "react";
import { Menu, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AppHeaderProps {
  title?: string;
  onMobileMenuToggle?: () => void;
  onQuickAction?: () => void;
}

export function AppHeader({
  title = "Controle Financeiro",
  onMobileMenuToggle,
  onQuickAction,
}: AppHeaderProps) {
  return (
    <header className="h-14 bg-gray-900/90 border-b border-gray-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            aria-label="Abrir menu de navegação"
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-white tracking-tight sm:text-lg truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          aria-label="Notificações"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {onQuickAction && (
          <Button
            size="sm"
            onClick={onQuickAction}
            className="h-8 text-xs font-medium px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova Transação</span>
          </Button>
        )}
      </div>
    </header>
  );
}
