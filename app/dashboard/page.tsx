"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoading } from "@/components/ui/page-loading";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { DashboardGreeting, DashboardMonthSelector } from "@/features/dashboard/components/dashboard-greeting";
import { PeriodForecastSection } from "@/features/dashboard/components/period-forecast-section";
import { ExpensesCategoryChart } from "@/features/dashboard/components/expenses-category-chart";
import { UpcomingExpensesList } from "@/features/dashboard/components/upcoming-expenses-list";
import { AccountsSummaryList } from "@/features/dashboard/components/accounts-summary-list";
import { ActivePlanejamentoWidget } from "@/features/dashboard/components/active-planejamento-widget";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  RotateCcw,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const { data, isLoading, isError, error, refetch } = useDashboardSummary(selectedMonth);

  return (
    <AppShell title="Visão Geral">
      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <div className="space-y-4 max-w-xl mx-auto py-12 text-center">
          <Alert variant="danger" title="Erro ao carregar Dashboard">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os dados financeiros do período."}
          </Alert>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => refetch()} variant="secondary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-0 md:gap-6 md:block md:space-y-6 animate-in fade-in duration-200">
          {/* Primeira Dobra: Saudação */}
          <div className="order-1 md:order-none">
            <DashboardGreeting
              userName="Clayton e Janine"
              familyTitle={data.familia.nome}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              hideMonthSelectorOnMobile={true}
            />
          </div>

          <div className="order-3 md:order-none hidden md:block">
            <ActivePlanejamentoWidget familiaId={data.familia.id} />
          </div>

          {/* Seção Previsão do Período */}
          <div className="order-2 md:order-none">
            <PeriodForecastSection 
              renderMobileMonthSelector={
                <DashboardMonthSelector 
                  selectedMonth={selectedMonth} 
                  onMonthChange={setSelectedMonth}
                  className="w-full sm:w-auto flex justify-between sm:justify-start mt-2" 
                />
              }
            />
          </div>

          <div className="order-4 md:order-none md:hidden mt-2">
            <ActivePlanejamentoWidget familiaId={data.familia.id} />
          </div>

          {/* Cards Principais da Primeira Dobra */}
          <div className="order-5 md:order-none flex flex-col gap-6 md:block md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Saldo Atual Familiar"
              value={data.saldo_atual}
              icon={<Wallet className="w-5 h-5 text-primary" />}
              description="Soma de todas as contas ativas"
              variant="highlight"
            />

            <StatCard
              title="Receitas do Mês"
              value={data.receitas_recebidas}
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
              trend={{
                value: `Pendente: US$ ${data.receitas_pendentes.toFixed(2)}`,
                isPositive: true,
              }}
              description="Receitas já recebidas"
              variant="positive"
            />

            <StatCard
              title="Despesas do Mês"
              value={-data.despesas_pagas}
              icon={<TrendingDown className="w-5 h-5 text-danger" />}
              trend={{
                value: `Pendente: US$ ${data.despesas_pendentes.toFixed(2)}`,
                isNegative: true,
              }}
              description="Despesas já pagas"
              variant="negative"
            />

            <StatCard
              title="Saldo Previsto"
              value={data.saldo_previsto}
              icon={<CalendarCheck className="w-5 h-5 text-amber-400" />}
              description="Final do mês atual"
              variant="neutral"
            />
          </div>

          {/* Grid Intermediário: Contas, Próximas Despesas e Gráfico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AccountsSummaryList accounts={data.contas} />
              <UpcomingExpensesList expenses={data.proximas_despesas} />
            </div>

            <div className="lg:col-span-1">
              <ExpensesCategoryChart categories={data.despesas_por_categoria} />
            </div>
          </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
