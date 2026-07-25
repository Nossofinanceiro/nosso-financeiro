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
    <div className="space-y-6 mt-12 mb-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Previsão do Período
          </h2>
          <p className="text-sm text-muted">Analise seu dinheiro disponível até uma data</p>
        </div>
        
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          <Button
            variant={mode === "proximo_pagamento" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("proximo_pagamento")}
            className={mode === "proximo_pagamento" ? "bg-primary text-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Próximo Pagamento
          </Button>
          <Button
            variant={mode === "fim_mes" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("fim_mes")}
            className={mode === "fim_mes" ? "bg-primary text-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Fim do Mês
          </Button>
          <Button
            variant={mode === "personalizado" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("personalizado")}
            className={mode === "personalizado" ? "bg-primary text-foreground hover:bg-primary/90" : "text-muted hover:text-foreground hover:bg-surface-secondary"}
          >
            Personalizado
          </Button>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl bg-surface border border-border" />
          <Skeleton className="h-28 rounded-xl bg-surface border border-border" />
          <Skeleton className="h-28 rounded-xl bg-surface border border-border" />
          <Skeleton className="h-28 rounded-xl bg-surface border border-border" />
        </div>
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
          
          <div className="bg-surface/50 border border-border/50 p-4 rounded-xl flex flex-wrap gap-x-8 gap-y-2">
            <div className="text-sm">
              <span className="text-muted">Período: </span>
              <span className="text-foreground font-medium">
                {format(new Date(data.data_inicial), "dd MMM", { locale: ptBR })} a {format(new Date(data.data_final), "dd MMM yyyy", { locale: ptBR })}
              </span>
            </div>
            {data.proximo_pagamento && mode === "proximo_pagamento" && (
              <div className="text-sm">
                <span className="text-muted">Data do Pagamento: </span>
                <span className="text-primary font-medium">
                  {format(new Date(data.proximo_pagamento.data), "dd MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col justify-between bg-surface border-border">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Saldo Atual</h3>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(data.saldo_atual_familiar)}</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between bg-surface border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                <h3 className="text-sm font-medium text-foreground">Despesas no Período</h3>
              </div>
              <p className="text-xl font-bold text-danger">-{formatCurrency(data.despesas_pendentes_no_periodo)}</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between bg-surface border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-primary">Disponível (Dinheiro Atual)</h3>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(data.disponivel_com_dinheiro_atual)}</p>
              <p className="text-xs text-muted mt-1">Quanto sobra pagando apenas com o que já tem</p>
            </Card>

            {mode === "proximo_pagamento" && data.proximo_pagamento ? (
              <Card className="p-5 flex flex-col justify-between bg-surface border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <TrendingUp className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-medium text-foreground">Pós Pagamento</h3>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(data.disponivel_com_dinheiro_atual + data.proximo_pagamento.valor)}
                </p>
                <p className="text-xs text-muted mt-1">Saldo após entrar {formatCurrency(data.proximo_pagamento.valor)}</p>
              </Card>
            ) : (
              <Card className="p-5 flex flex-col justify-between bg-surface border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-medium text-foreground">Previsto em {format(new Date(data.data_final), "dd/MM")}</h3>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(data.saldo_previsto_na_data_final)}</p>
                <p className="text-xs text-muted mt-1">
                  Inclui {formatCurrency(data.receitas_previstas_no_periodo)} de receitas no período
                </p>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                Despesas consideradas no cálculo
              </h4>
              <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-slate-800/50">
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
                            <Badge variant="neutral" className="bg-danger/10 text-danger py-0 text-[9px]">Atrasada</Badge>
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

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Receitas previstas no período
              </h4>
              <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-slate-800/50">
                {data.lancamentos_receitas.length > 0 ? (
                  data.lancamentos_receitas.map(r => {
                    // @ts-expect-error - Joined property from Supabase
                    const categoria = r.categorias;
                    // @ts-expect-error - Joined property from Supabase
                    const conta = r.contas;
                    const Icon = getDynamicIcon(categoria?.icone);
                    return (
                      <div key={r.id} className="p-3 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-muted">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-foreground font-medium">{r.descricao}</p>
                            <p className="text-xs text-muted flex items-center gap-2">
                              <span>{conta?.nome || "Sem conta"}</span>
                              <span>•</span>
                              <span>{format(new Date(r.data_prevista!), "dd MMM")}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{formatCurrency(r.valor_previsto)}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-6 text-center text-sm text-muted">
                    Nenhuma receita extra no período.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
