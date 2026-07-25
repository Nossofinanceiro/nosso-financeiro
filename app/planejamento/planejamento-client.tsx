"use client";

import React, { useEffect, useState } from "react";
import { PlanejamentosRepository } from "@/lib/repositories/planejamentos.repository";
import { Planejamento } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, ArrowRight, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  familiaId: string;
}

export function PlanejamentoClient({ familiaId }: Props) {
  const router = useRouter();
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const repo = new PlanejamentosRepository();
        const data = await repo.getPlanejamentos(familiaId);
        setPlanejamentos(data);
      } catch (error) {
        console.error("Erro ao carregar planejamentos", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [familiaId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Simulador de Cenários
          </h1>
          <p className="text-muted mt-2">Simule grandes decisões financeiras antes de tomá-las na vida real.</p>
        </div>
        <Button className="rounded-full shadow-lg" onClick={() => router.push("/planejamento/novo")}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Cenário
        </Button>
      </div>

      {planejamentos.length > 0 ? (
        <div className="space-y-12">
          {/* Sessão de Comparação (Se houver 2 ou mais) */}
          {planejamentos.length >= 2 && (
            <div className="bg-surface-secondary/50 border border-border rounded-[2rem] p-6 lg:p-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
                Comparação de Cenários
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {planejamentos.slice(0, 2).map((plan, index) => {
                  const entradas = plan.itens?.filter(i => i.tipo === "entrada") || [];
                  const saidas = plan.itens?.filter(i => i.tipo === "saida") || [];
                  
                  const impactoMensal = entradas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0) - 
                                        saidas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0);

                  const impactoAVista = entradas.filter(i => !i.mensal).reduce((acc, i) => acc + i.valor, 0) - 
                                        saidas.filter(i => !i.mensal).reduce((acc, i) => acc + i.valor, 0);

                  return (
                    <div key={plan.id} className={`p-6 rounded-[1.5rem] border ${index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-surface border-border'} relative overflow-hidden`}>
                      {index === 0 && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                          Menor Impacto
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-foreground mb-4">{plan.titulo}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted">Impacto Mensal</span>
                          <span className={`font-bold ${impactoMensal < 0 ? 'text-danger' : 'text-emerald-500'}`}>
                            {impactoMensal > 0 ? '+' : ''}{formatCurrency(impactoMensal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted">Impacto à Vista (Caixa)</span>
                          <span className={`font-bold ${impactoAVista < 0 ? 'text-danger' : 'text-emerald-500'}`}>
                            {impactoAVista > 0 ? '+' : ''}{formatCurrency(impactoAVista)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planejamentos.map(plan => {
              const entradas = plan.itens?.filter(i => i.tipo === "entrada") || [];
              const saidas = plan.itens?.filter(i => i.tipo === "saida") || [];
              
              const impactoMensal = entradas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0) - 
                                    saidas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0);

              return (
                <Link href={`/planejamento/${plan.id}`} key={plan.id} className="group cursor-pointer">
                  <Card className="h-full bg-surface hover:bg-surface-secondary border-border rounded-[2rem] p-6 lg:p-8 transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Target className="w-6 h-6" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-semibold text-muted capitalize">
                          {plan.status}
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{plan.titulo}</h2>
                      {plan.descricao && (
                        <p className="text-sm text-muted line-clamp-2 mb-6">{plan.descricao}</p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-border-subtle mt-auto space-y-4">
                      {plan.data_prevista && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Calendar className="w-4 h-4" />
                          <span>Alvo: {format(new Date(plan.data_prevista), "MMM yyyy", { locale: ptBR })}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Impacto Mensal</p>
                          <p className={`text-lg font-bold ${impactoMensal < 0 ? 'text-danger' : impactoMensal > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                            {impactoMensal > 0 ? '+' : ''}{formatCurrency(impactoMensal)}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Target className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Nenhum cenário planejado</h2>
          <p className="text-muted max-w-md mx-auto mb-8">
            Você ainda não criou nenhuma simulação. Crie um cenário para ver como decisões financeiras afetarão seu futuro.
          </p>
          <Button size="lg" className="rounded-full shadow-lg" onClick={() => router.push("/planejamento/novo")}>
            <Plus className="w-5 h-5 mr-2" />
            Criar Primeira Simulação
          </Button>
        </div>
      )}
    </div>
  );
}
