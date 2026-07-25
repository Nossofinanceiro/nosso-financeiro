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
  Tag
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

  return (
    <div className="space-y-6 mt-8 mb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Até o Próximo Pagamento
          </h2>
          <p className="text-sm text-muted mt-1">Visão imediata do seu fôlego financeiro</p>
        </div>
        
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          <Button
            variant={mode === "proximo_pagamento" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("proximo_pagamento")}
            className={mode === "proximo_pagamento" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Próximo Pagamento
          </Button>
          <Button
            variant={mode === "fim_mes" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("fim_mes")}
            className={mode === "fim_mes" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Fim do Mês
          </Button>
          <Button
            variant={mode === "personalizado" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("personalizado")}
            className={mode === "personalizado" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Personalizado
          </Button>
        </div>
      </div>

      {/* Date Pickers for custom mode */}
      {mode === "personalizado" && (
        <div className="flex items-center gap-4 bg-surface border border-border p-4 rounded-xl w-max">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">De:</span>
            <input 
              type="date" 
              value={dataInicial} 
              onChange={(e) => setDataInicial(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Até:</span>
            <input 
              type="date" 
              value={dataFinal} 
              onChange={(e) => {
                if (e.target.value >= dataInicial) {
                  setDataFinal(e.target.value);
                }
              }}
              min={dataInicial}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 rounded-3xl bg-surface border border-border" />
      ) : isError ? (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-center">
          Ocorreu um erro ao carregar a previsão.
        </div>
      ) : data ? (
        <div className="space-y-6">
          {mode === "proximo_pagamento" && !data.proximo_pagamento && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-amber-500">Nenhum próximo pagamento cadastrado no sistema. O período analisado estendeu-se até o fim do mês.</p>
            </div>
          )}

          {/* Destaque Gigante */}
          <Card className="bg-surface border-border overflow-hidden rounded-3xl p-6 md:p-10 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna 1 e 2: Saldo Atual e Despesas -> Vai sobrar */}
              <div className="lg:col-span-2 space-y-8 flex flex-col justify-center">
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                  <div>
                    <p className="text-sm font-medium text-muted mb-1">Saldo disponível hoje</p>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(data.saldo_atual_familiar)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted mb-1">Contas a pagar até dia {format(new Date(data.data_final), "dd/MM")}</p>
                    <p className="text-2xl font-semibold text-danger">-{formatCurrency(data.despesas_pendentes_no_periodo)}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border-subtle">
                  <p className="text-lg font-medium text-foreground mb-2">Vai sobrar</p>
                  <p className={`text-5xl md:text-6xl font-black tracking-tight ${data.disponivel_com_dinheiro_atual >= 0 ? "text-primary" : "text-danger"}`}>
                    {formatCurrency(data.disponivel_com_dinheiro_atual)}
                  </p>
                </div>

              </div>

              {/* Coluna 3: Próximo Pagamento Info */}
              <div className="lg:col-span-1">
                {data.proximo_pagamento && mode === "proximo_pagamento" ? (
                  <div className="h-full bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-24 h-24 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      Próximo Pagamento
                    </p>
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-sm text-primary/80">Quem recebe</p>
                        <p className="text-lg font-semibold text-primary">{data.proximo_pagamento.pessoas?.join(", ") || "Geral"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary/80">Data prevista</p>
                        <p className="text-xl font-bold text-primary">{format(new Date(data.proximo_pagamento.data!), "dd/MM/yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary/80">Valor total estimado</p>
                        <p className="text-2xl font-black text-primary">+{formatCurrency(data.proximo_pagamento.valor)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-surface-secondary border border-border rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Calendar className="w-24 h-24 text-foreground" />
                    </div>
                    <p className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Final do Período
                    </p>
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-sm text-muted">Data limite</p>
                        <p className="text-xl font-bold text-foreground">{format(new Date(data.data_final), "dd/MM/yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Receitas no período</p>
                        <p className="text-2xl font-black text-primary">+{formatCurrency(data.receitas_previstas_no_periodo)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Saldo após receitas</p>
                        <p className="text-xl font-bold text-foreground">{formatCurrency(data.saldo_previsto_na_data_final)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Lista de Despesas */}
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Essas despesas entram nesse cálculo
            </h4>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border-subtle">
              {data.lancamentos_despesas.length > 0 ? (
                data.lancamentos_despesas.map(d => {
                  // @ts-expect-error - Joined property from Supabase
                  const categoria = d.categorias;
                  // @ts-expect-error - Joined property from Supabase
                  const conta = d.contas;
                  const Icon = getDynamicIcon(categoria?.icone);
                  return (
                    <div key={d.id} className="p-3 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-muted">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">{d.descricao}</p>
                          <p className="text-xs text-muted flex items-center gap-2">
                            <span>{conta?.nome || "Sem conta"}</span>
                            <span>•</span>
                            <span>{format(new Date(d.data_vencimento!), "dd MMM")}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{formatCurrency(d.valor_pago || d.valor_previsto)}</p>
                        {d.status === "atrasada" && (
                          <Badge variant="neutral" className="bg-danger/10 text-danger py-0 text-[9px] mt-1 block w-max ml-auto">Atrasada</Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-sm text-muted">
                  Nenhuma despesa pendente no período.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
