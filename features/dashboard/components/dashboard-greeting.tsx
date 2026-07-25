"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export interface DashboardGreetingProps {
  userName: string;
  familyTitle?: string;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

export function DashboardGreeting({
  userName,
  familyTitle,
  selectedMonth,
  onMonthChange,
}: DashboardGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-sm text-gray-400">
          {familyTitle ? `Família: ${familyTitle}` : "Visão geral e controle financeiro familiar."}
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 p-1.5 rounded-xl shadow-md self-start sm:self-auto">
        <button
          onClick={handlePrevMonth}
          aria-label="Mês anterior"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2 text-sm font-semibold text-white">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="min-w-[120px] text-center font-medium">
            {formatMonthDisplay(selectedMonth)}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          aria-label="Próximo mês"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
