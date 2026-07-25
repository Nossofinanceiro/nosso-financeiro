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
  ChevronRight
} from "lucide-react";
import * as Icons from "lucide-react";

type Mode = PeriodForecastRequest["modo"];

export function PeriodForecastSection() {
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
    const isWarning = !isNegative && resultado < 150;

    let statusColor = "";
    let statusBg = "";
    let titleMessage = "";
    let assistantMessage = "";
    let titleColor = "";

    if (isNegative) {
      statusColor = "text-danger";
      statusBg = "bg-danger/10 border border-danger/20";
      titleColor = "text-danger";
      titleMessage = "FALTARÃO";
      assistantMessage = `🚨 Faltarão aproximadamente ${formatCurrency(Math.abs(resultado))} antes do próximo pagamento.`;
    } else if (isWarning) {
      statusColor = "text-amber-500";
      statusBg = "bg-amber-500/10 border border-amber-500/20";
      titleColor = "text-amber-500";
      titleMessage = "VOCÊ TERÁ";
      assistantMessage = "⚠️ Atenção. O orçamento está bastante apertado para este período.";
    } else {
      statusColor = "text-emerald-500";
      statusBg = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600";
      titleColor = "text-emerald-500";
      titleMessage = "VOCÊ TERÁ";
      assistantMessage = "✅ Vocês conseguem chegar ao próximo pagamento com tranquilidade.";
    }

    const topDespesas = [...data.lancamentos_despesas]
      .sort((a, b) => (b.valor_pago || b.valor_previsto) - (a.valor_pago || a.valor_previsto))
      .slice(0, 3);

    return (
      <div className="space-y-6 mt-6">
        {mode === "proximo_pagamento" && !data.proximo_pagamento && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-500">Nenhum próximo pagamento cadastrado no sistema. O período analisado estendeu-se até o fim do mês.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Giant Card */}
          <div className="lg:col-span-2">
            <Card className="bg-surface border-border overflow-hidden rounded-[2rem] p-8 md:p-12 shadow-xl h-full flex flex-col justify-center text-center relative">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className={`text-xl md:text-2xl font-bold tracking-widest ${titleColor} mb-2`}>
                    {titleMessage}
                  </h3>
                  <p className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter ${statusColor}`}>
                    {formatCurrency(Math.abs(resultado))}
                  </p>
                  <div className="flex justify-center mt-6">
                    <div className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm ${statusBg}`}>
                      {assistantMessage}
                    </div>
                  </div>
                </div>

                {/* Matemática Visual */}
                <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-4 text-center bg-surface-secondary/50 rounded-2xl p-6 border border-border">
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-muted mb-1">Saldo hoje</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(data.saldo_atual_familiar)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted hidden md:block opacity-50" />
                  <ArrowDown className="w-5 h-5 text-muted block md:hidden opacity-50" />
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-muted mb-1">Contas do período</p>
                    <p className="text-xl font-bold text-danger">-{formatCurrency(data.despesas_pendentes_no_periodo)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted hidden md:block opacity-50" />
                  <ArrowDown className="w-5 h-5 text-muted block md:hidden opacity-50" />
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-muted mb-1">Resultado final</p>
                    <p className={`text-xl font-bold ${statusColor}`}>{formatCurrency(resultado)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Next Payment & Top 3 */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {data.proximo_pagamento && mode === "proximo_pagamento" ? (
              <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden flex-1">
                <div className="absolute -top-4 -right-4 opacity-5">
                  <TrendingUp className="w-32 h-32 text-primary" />
                </div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  Próximo Pagamento
                </p>
                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                      {data.proximo_pagamento.pessoas?.join(", ") || "Geral"}
                    </p>
                    <p className="text-base text-primary font-medium mt-1">
                      {format(new Date(data.proximo_pagamento.data!), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="pt-5 border-t border-border-subtle">
                    <p className="text-sm text-muted mb-1">Valor total estimado</p>
                    <p className="text-3xl font-black text-primary">+{formatCurrency(data.proximo_pagamento.valor)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden flex-1">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                  <Calendar className="w-4 h-4 text-foreground" />
                  Final do Período
                </p>
                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-sm text-muted">Data limite analisada</p>
                    <p className="text-xl font-bold text-foreground">
                      {format(new Date(data.data_final), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="pt-5 border-t border-border-subtle">
                    <p className="text-sm text-muted mb-1">Receitas previstas</p>
                    <p className="text-3xl font-black text-primary">+{formatCurrency(data.receitas_previstas_no_periodo)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface border border-border rounded-[2rem] p-6 lg:p-8 shadow-sm">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-5 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                Maiores Despesas (Top 3)
              </p>
              <div className="space-y-4">
                {topDespesas.map((d, index) => {
                  const percent = data.despesas_pendentes_no_periodo > 0 
                    ? ((d.valor_pago || d.valor_previsto) / data.despesas_pendentes_no_periodo) * 100 
                    : 0;
                  return (
                    <div key={d.id} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs font-bold text-muted">{index + 1}.</span>
                          <p className="text-sm font-medium text-foreground truncate">{d.descricao}</p>
                        </div>
                        <p className="text-sm font-bold text-danger shrink-0 ml-3">
                          {formatCurrency(d.valor_pago || d.valor_previsto)}
                        </p>
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
        <div className="mt-8">
          <details className="group bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between cursor-pointer list-none p-5 text-sm font-bold text-foreground hover:bg-surface-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
                Ver todas as contas deste cálculo ({data.lancamentos_despesas.length})
              </div>
              <ChevronRight className="w-5 h-5 text-muted transition-transform group-open:rotate-90" />
            </summary>
            
            <div className="bg-surface border-t border-border divide-y divide-border-subtle max-h-96 overflow-y-auto">
              {data.lancamentos_despesas.length > 0 ? (
                data.lancamentos_despesas.map(d => {
                  // @ts-expect-error - Joined property from Supabase
                  const categoria = d.categorias;
                  // @ts-expect-error - Joined property from Supabase
                  const conta = d.contas;
                  const Icon = getDynamicIcon(categoria?.icone);
                  return (
                    <div key={d.id} className="p-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-muted shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">{d.descricao}</p>
                          <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                            <span>{conta?.nome || "Sem conta"}</span>
                            <span className="text-[10px]">•</span>
                            <span>{format(new Date(d.data_vencimento!), "dd MMM")}</span>
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
    <div className="mt-8 mb-16 animate-in fade-in duration-200">
      {/* Header Interativo */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
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
            className={`whitespace-nowrap ${mode === "proximo_pagamento" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Próximo Pagamento
          </Button>
          <Button
            variant={mode === "fim_mes" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("fim_mes")}
            className={`whitespace-nowrap ${mode === "fim_mes" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Fim do Mês
          </Button>
          <Button
            variant={mode === "personalizado" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("personalizado")}
            className={`whitespace-nowrap ${mode === "personalizado" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}`}
          >
            Personalizado
          </Button>
        </div>
      </div>

      {/* Date Pickers apenas se Personalizado */}
      {mode === "personalizado" && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border p-4 rounded-xl mt-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted w-8">De:</span>
            <input 
              type="date" 
              value={dataInicial} 
              onChange={(e) => setDataInicial(e.target.value)}
              className="flex-1 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="flex-1 bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
