"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePeriodForecast } from "@/hooks/use-period-forecast";
import { PeriodForecastRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight,
  ArrowDown,
  ChevronRight,
  User,
  CalendarClock,
  CircleDollarSign
} from "lucide-react";
import * as Icons from "lucide-react";

type Mode = PeriodForecastRequest["modo"];

export function PeriodForecastSection({ renderMobileMonthSelector }: { renderMobileMonthSelector?: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("forecast-mode");
      if (saved === "proximo_pagamento" || saved === "fim_mes" || saved === "personalizado") {
        return saved;
      }
    }
    return "proximo_pagamento";
  });

  const [dataInicial, setDataInicial] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("forecast-start");
      if (saved) return saved;
    }
    return format(new Date(), "yyyy-MM-dd");
  });

  const [dataFinal, setDataFinal] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("forecast-end");
      if (saved) return saved;
    }
    return format(new Date(), "yyyy-MM-dd");
  });

  React.useEffect(() => {
    localStorage.setItem("forecast-mode", mode);
    if (mode === "personalizado") {
      localStorage.setItem("forecast-start", dataInicial);
      localStorage.setItem("forecast-end", dataFinal);
    }
  }, [mode, dataInicial, dataFinal]);

  const { data, isLoading, isError } = usePeriodForecast({
    modo: mode,
    dataInicial: mode === "personalizado" ? dataInicial : undefined,
    dataFinal: mode === "personalizado" ? dataFinal : undefined,
  });

  const getDynamicIcon = (iconName?: string) => {
    if (!iconName) return Tag;
    const name = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-./g, (x: string) => x[1].toUpperCase());
    const iconMap = Icons as unknown as Record<string, React.ElementType>;
    return iconMap[name] || Tag;
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-[400px] rounded-3xl bg-surface border border-border mt-6" />;
    }

    if (isError) {
      return (
        <div className="p-4 mt-6 bg-danger/10 border border-danger/20 text-danger rounded-xl text-center">
          Ocorreu um erro ao carregar a previsão.
        </div>
      );
    }

    if (!data) return null;

    const resultado = data.disponivel_com_dinheiro_atual;
    const isNegative = resultado < 0;

    // Lógica da barra de comprometimento
    let percentualComprometido = 0;
    if (data.saldo_atual_familiar > 0) {
      percentualComprometido = (data.despesas_pendentes_no_periodo / data.saldo_atual_familiar) * 100;
    } else if (data.despesas_pendentes_no_periodo > 0) {
      percentualComprometido = 104; // Simulando > 100%
    }

    let statusIcon = "";
    let statusLabel = "";
    let barColor = "";
    let statusColor = "";
    let statusBg = "";
    let titleMessage = "";
    let assistantMessage = "";

    if (percentualComprometido <= 60) {
      statusIcon = "🟢";
      statusLabel = "Situação confortável";
      barColor = "bg-emerald-500";
      statusColor = "text-emerald-500";
      statusBg = "bg-emerald-500/10 text-emerald-600";
      titleMessage = "VOCÊ TERÁ";
      assistantMessage = "✅ Vocês conseguem chegar ao próximo pagamento com tranquilidade.";
    } else if (percentualComprometido <= 85) {
      statusIcon = "🟡";
      statusLabel = "Atenção";
      barColor = "bg-amber-400";
      statusColor = "text-amber-500";
      statusBg = "bg-amber-500/10 text-amber-600";
      titleMessage = "VOCÊ TERÁ";
      assistantMessage = "⚠️ Atenção. O orçamento está bastante apertado para este período.";
    } else if (percentualComprometido <= 100) {
      statusIcon = "🟠";
      statusLabel = "Orçamento apertado";
      barColor = "bg-orange-500";
      statusColor = "text-orange-500";
      statusBg = "bg-orange-500/10 text-orange-600";
      titleMessage = "VOCÊ TERÁ";
      assistantMessage = "⚠️ Atenção. Há dinheiro exato, sem margem de erro.";
    } else {
      statusIcon = "🔴";
      statusLabel = "Orçamento insuficiente";
      barColor = "bg-red-500";
      statusColor = "text-danger";
      statusBg = "bg-danger/10 text-danger";
      titleMessage = "FALTARÃO";
      assistantMessage = `🚨 Faltarão aproximadamente ${formatCurrency(Math.abs(resultado))} antes do próximo pagamento.`;
    }

    const topDespesas = [...data.lancamentos_despesas]
      .sort((a, b) => (b.valor_pago || b.valor_previsto) - (a.valor_pago || a.valor_previsto))
      .slice(0, 3);

    const sortedDespesas = [...data.lancamentos_despesas].sort((a, b) => new Date(a.data_vencimento!).getTime() - new Date(b.data_vencimento!).getTime());

    return (
      <div className="contents md:block">
        {mode === "proximo_pagamento" && !data.proximo_pagamento && (
          <div className="order-1 md:order-none md:mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-500">Nenhum próximo pagamento cadastrado no sistema. O período analisado estendeu-se até o fim do mês.</p>
          </div>
        )}

        <div className="contents md:grid md:grid-cols-1 xl:grid-cols-3 md:gap-6">
          {/* Main Giant Card */}
          <div className="order-3 md:order-none xl:col-span-2 flex flex-col">
            <Card className="bg-surface border-border overflow-hidden rounded-[2rem] p-6 md:p-12 shadow-xl flex-1 flex flex-col justify-center text-center relative transition-all duration-500">
              <div className="relative z-10 flex flex-col justify-between items-center h-full">
                
                {/* Cabeçalho do Card */}
                <div className="flex flex-col items-center justify-center space-y-6 w-full">
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {statusIcon} {statusLabel}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-widest text-foreground opacity-90 transition-all duration-500">
                      {titleMessage}
                    </h3>
                  </div>

                  {/* Número Principal */}
                  <p className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter ${statusColor} transition-all duration-500 drop-shadow-sm`}>
                    {isNegative ? formatCurrency(resultado) : formatCurrency(resultado)}
                  </p>
                  
                  {/* Assistant Message */}
                  <div className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-500 ${statusBg}`}>
                    {assistantMessage}
                  </div>
                </div>

                {/* Barra de Comprometimento */}
                <div className="w-full max-w-lg mx-auto mt-12 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">Comprometimento</span>
                    <span className={`text-sm font-bold ${percentualComprometido > 100 ? "text-danger" : "text-foreground"}`}>
                      {percentualComprometido.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
                      style={{ width: `${Math.min(percentualComprometido, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Matemática Visual - Estilo Fórmula */}
                <div className="mt-8 flex flex-wrap justify-center items-center gap-3 md:gap-6 text-center bg-surface-secondary/40 rounded-[1.5rem] p-6 border border-border/50 w-full">
                  <div className="flex flex-col items-center min-w-28">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Saldo disponível</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(data.saldo_atual_familiar)}</p>
                  </div>
                  <p className="text-xl font-black text-muted-foreground">−</p>
                  <div className="flex flex-col items-center min-w-28">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Despesas do período</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(data.despesas_pendentes_no_periodo)}</p>
                  </div>
                  <p className="text-xl font-black text-muted-foreground">=</p>
                  <div className="flex flex-col items-center min-w-28">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Resultado</p>
                    <p className={`text-lg font-bold ${statusColor}`}>{formatCurrency(resultado)}</p>
                  </div>
                </div>

              </div>
            </Card>
          </div>

          {/* Right Column: Next Payment & Top 3 */}
          <div className="contents md:flex xl:col-span-1 md:flex-col md:gap-6">
            {data.proximo_pagamento ? (
              <div className="order-4 md:order-none bg-surface border border-border rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden flex-1 transition-all duration-500">
                <div className="absolute -top-4 -right-4 opacity-[0.03]">
                  <Wallet className="w-32 h-32 text-foreground" />
                </div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-8 flex items-center gap-2 relative z-10">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  {data.proximo_pagamento.itens && data.proximo_pagamento.itens.length > 1 ? "Próximos Pagamentos" : "Próximo Pagamento"}
                </p>
                <div className="space-y-6 relative z-10">
                  {data.proximo_pagamento.itens && data.proximo_pagamento.itens.length > 1 ? (
                    <div className="space-y-4">
                      {data.proximo_pagamento.itens.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                          <div>
                            <p className="text-lg font-bold text-foreground">{item.pessoa || "Geral"}</p>
                            <p className="text-sm font-medium text-muted">{item.descricao}</p>
                          </div>
                          <p className="text-xl font-bold text-primary">{formatCurrency(item.valor)}</p>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted mb-0.5">Total em {format(new Date(data.proximo_pagamento.data!), "dd 'de' MMMM", { locale: ptBR })}</p>
                          <p className="text-xs text-muted">Faltam {Math.max(0, Math.ceil((new Date(data.proximo_pagamento.data!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias</p>
                        </div>
                        <p className="text-2xl font-black text-primary">{formatCurrency(data.proximo_pagamento.valor)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground leading-tight">
                            {data.proximo_pagamento.descricao}
                          </p>
                          <p className="text-sm text-muted font-medium mt-0.5">
                            {data.proximo_pagamento.pessoas?.join(", ") || "Geral"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <CalendarClock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {format(new Date(data.proximo_pagamento.data!), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted font-medium mt-0.5">
                            Faltam {Math.max(0, Math.ceil((new Date(data.proximo_pagamento.data!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <CircleDollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-black text-primary">
                          {formatCurrency(data.proximo_pagamento.valor)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="order-4 md:order-none bg-surface border border-border rounded-[2rem] p-8 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden flex-1 transition-all duration-500">
                <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center text-muted mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-foreground mb-2">Nenhum próximo pagamento cadastrado.</p>
                <p className="text-sm text-muted mb-6">Mantenha suas receitas atualizadas para prever seu saldo.</p>
                <Button variant="secondary" className="border-border text-foreground hover:bg-surface-secondary" onClick={() => window.location.href = "/receitas"}>
                  Cadastrar pagamento
                </Button>
              </div>
            )}

            <div className="order-6 md:order-none bg-surface border border-border rounded-[2rem] p-6 lg:p-8 shadow-sm transition-all duration-500">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                Maiores Despesas (Top 3)
              </p>
              <div className="space-y-5">
                {topDespesas.map((d, index) => {
                  const percent = data.despesas_pendentes_no_periodo > 0 
                    ? ((d.valor_pago || d.valor_previsto) / data.despesas_pendentes_no_periodo) * 100 
                    : 0;
                  return (
                    <div key={d.id} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs font-bold text-muted w-4">{index + 1}.</span>
                          <p className="text-sm font-medium text-foreground truncate">{d.descricao}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <p className="text-xs font-semibold text-muted bg-surface-secondary px-2 py-0.5 rounded-md">
                            {percent.toFixed(0)}%
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(d.valor_pago || d.valor_previsto)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-danger/50 rounded-full" 
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {topDespesas.length === 0 && (
                  <p className="text-sm text-muted">Nenhuma despesa pendente.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lista completa das despesas condensada */}
        <div className="order-7 md:order-none md:mt-8">
          <details className="group bg-surface border border-border rounded-[1.5rem] overflow-hidden shadow-sm transition-all duration-300">
            <summary className="flex items-center justify-between cursor-pointer list-none p-5 text-sm font-bold text-foreground hover:bg-surface-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-foreground">
                  <TrendingDown className="w-4 h-4" />
                </div>
                Ver despesas consideradas ({sortedDespesas.length})
              </div>
              <ChevronRight className="w-5 h-5 text-muted transition-transform duration-300 group-open:rotate-90" />
            </summary>
            
            <div className="bg-surface border-t border-border divide-y divide-border-subtle max-h-96 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
              {sortedDespesas.length > 0 ? (
                sortedDespesas.map(d => {
                  // @ts-expect-error - Joined property from Supabase
                  const categoria = d.categorias;
                  // @ts-expect-error - Joined property from Supabase
                  const conta = d.contas;
                  const Icon = getDynamicIcon(categoria?.icone);
                  return (
                    <div key={d.id} className="p-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-muted shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-semibold">{d.descricao}</p>
                          <p className="text-xs text-muted flex items-center gap-2 mt-1">
                            <span className="bg-surface-secondary px-2 py-0.5 rounded-sm">{format(new Date(d.data_vencimento!), "dd MMM")}</span>
                            <span className="text-border">•</span>
                            <span>{conta?.nome || "Sem conta"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(d.valor_pago || d.valor_previsto)}</p>
                        {d.status === "atrasada" && (
                          <Badge variant="neutral" className="bg-danger/10 text-danger py-0 text-[10px] mt-1 block w-max ml-auto border-danger/20">Atrasada</Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-sm text-muted">
                  Nenhuma despesa pendente no período.
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 md:mt-8 mb-16 animate-in fade-in duration-500 flex flex-col gap-4 md:gap-0 md:block">
      {/* Header Interativo */}
      <div className="order-2 md:order-none flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Até o Próximo Pagamento
          </h2>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <p className="text-sm text-muted">Visão imediata do seu fôlego financeiro</p>
            {mode !== "personalizado" && data && (
              <>
                <span className="text-border hidden sm:inline">•</span>
                <p className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  Período analisado: Hoje → {format(new Date(data.data_final), "dd MMM")}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex bg-surface border border-border p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          <Button
            variant={mode === "proximo_pagamento" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("proximo_pagamento")}
            className={`whitespace-nowrap transition-colors ${mode === "proximo_pagamento" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Próximo Pagamento
          </Button>
          <Button
            variant={mode === "fim_mes" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("fim_mes")}
            className={`whitespace-nowrap transition-colors ${mode === "fim_mes" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Fim do Mês
          </Button>
          <Button
            variant={mode === "personalizado" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("personalizado")}
            className={`whitespace-nowrap transition-colors ${mode === "personalizado" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Personalizado
          </Button>
        </div>
      </div>

      {/* Date Pickers & Mobile Month Selector */}
      <div className="order-5 md:order-none flex flex-col gap-4 md:mt-6">
        {mode === "personalizado" && (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border p-4 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted w-8">De:</span>
            <input 
              type="date" 
              value={dataInicial} 
              onChange={(e) => setDataInicial(e.target.value)}
              className="flex-1 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted w-8">Até:</span>
            <input 
              type="date" 
              value={dataFinal} 
              onChange={(e) => {
                if (e.target.value >= dataInicial) {
                  setDataFinal(e.target.value);
                }
              }}
              min={dataInicial}
              className="flex-1 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          </div>
        )}
        
        {renderMobileMonthSelector && (
          <div className="md:hidden">
            {renderMobileMonthSelector}
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
}
