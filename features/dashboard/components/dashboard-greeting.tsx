"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export interface DashboardGreetingProps {
  userName: string;
  familyTitle?: string;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  hideMonthSelectorOnMobile?: boolean;
}

export function DashboardMonthSelector({ selectedMonth, onMonthChange, className }: { selectedMonth: string, onMonthChange: (month: string) => void, className?: string }) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    const newMonthStr = date.toISOString().slice(0, 7);
    onMonthChange(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    const newMonthStr = date.toISOString().slice(0, 7);
    onMonthChange(newMonthStr);
  };

  // Format month string (e.g., "2026-07" -> "Julho de 2026")
  const formatMonthDisplay = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      const str = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch {
      return monthStr;
    }
  };

  return (
    <div className={`flex items-center gap-2 bg-surface border border-border p-1.5 rounded-xl shadow-md self-start sm:self-auto ${className || ''}`}>
      <button
        onClick={handlePrevMonth}
        aria-label="Mês anterior"
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2 text-sm font-semibold text-foreground">
        <Calendar className="w-4 h-4 text-primary shrink-0" />
        <span className="min-w-[120px] text-center font-medium">
          {formatMonthDisplay(selectedMonth)}
        </span>
      </div>

      <button
        onClick={handleNextMonth}
        aria-label="Próximo mês"
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function DashboardGreeting({
  userName,
  familyTitle,
  selectedMonth,
  onMonthChange,
  hideMonthSelectorOnMobile = false,
}: DashboardGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 ${hideMonthSelectorOnMobile ? 'pb-0 border-none md:border-solid md:border-b md:border-border/80 md:pb-4' : 'pb-4 border-b border-border/80'}`}>
      <div className="space-y-0.5 sm:space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-sm text-muted">
          {familyTitle ? `Família: ${familyTitle}` : "Visão geral e controle financeiro familiar."}
        </p>
      </div>

      {/* Month Selector */}
      <DashboardMonthSelector 
        selectedMonth={selectedMonth} 
        onMonthChange={onMonthChange} 
        className={hideMonthSelectorOnMobile ? 'hidden md:flex' : 'flex'} 
      />
    </div>
  );
}
