"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Planejamento, PlanejamentoItem } from "@/lib/schemas";
import { PlanejamentosRepository } from "@/lib/repositories/planejamentos.repository";
import { SimulacaoService, SimulacaoResult } from "@/lib/services/simulacao.service";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Target, Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

interface Props {
  familiaId: string;
  planejamentoId: string;
}

export function PlanejamentoDetailClient({ familiaId, planejamentoId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isNew = planejamentoId === "novo";

  const [planejamento, setPlanejamento] = useState<Planejamento>({
    id: "",
    familia_id: familiaId,
    titulo: "",
    valor_estimado: 0,
    margem_seguranca: 0.10,
    itens: []
  } as unknown as Planejamento);

  const [simulacao, setSimulacao] = useState<SimulacaoResult | null>(null);

  // Variable Form States
  const [novoItemDescricao, setNovoItemDescricao] = useState("");
  const [novoItemValor, setNovoItemValor] = useState(0);
  const [novoItemTipo, setNovoItemTipo] = useState<any>("nova_despesa_mensal");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let planData = planejamento;
      if (!isNew) {
        const repo = new PlanejamentosRepository();
        const p = await repo.getPlanejamento(planejamentoId);
        if (p) {
          planData = p;
          setPlanejamento(p);
        }
      }

      const simService = new SimulacaoService();
      const sim = await simService.gerarSimulacao(planData);
      setSimulacao(sim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isNew, planejamentoId, familiaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recalculate simulation when planning changes
  useEffect(() => {
    if (loading) return;
    const simService = new SimulacaoService();
    simService.gerarSimulacao(planejamento).then(setSimulacao).catch(console.error);
  }, [planejamento]);

  const handleSave = async () => {
    if (!planejamento.titulo) return alert("Preencha o título");
    setSaving(true);
    try {
      const repo = new PlanejamentosRepository();
      let savedPlan: Planejamento;
      if (isNew) {
        savedPlan = await repo.createPlanejamento(planejamento);
      } else {
        savedPlan = await repo.updatePlanejamento(planejamento.id, planejamento);
      }

      if (!isNew) {
        // Delete all old items to recreate
        const oldPlan = await repo.getPlanejamento(planejamento.id);
        for (const item of oldPlan?.itens || []) {
          await repo.deleteItem(item.id);
        }
      }

      for (const item of planejamento.itens || []) {
        await repo.createItem({ ...item, planejamento_id: savedPlan.id });
      }

      router.push("/planejamento");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cenário");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!novoItemDescricao || novoItemValor <= 0) return;
    const newItem: PlanejamentoItem = {
      id: crypto.randomUUID(),
      planejamento_id: planejamento.id || "",
      tipo: novoItemTipo,
      descricao: novoItemDescricao,
      valor: novoItemValor,
      recorrencia: novoItemTipo.includes("mensal") || novoItemTipo === "parcelamento" ? "mensal" : "unica",
      mensal: novoItemTipo.includes("mensal") || novoItemTipo === "parcelamento",
    } as any;

    setPlanejamento(prev => ({
      ...prev,
      itens: [...(prev.itens || []), newItem]
    }));
    setNovoItemDescricao("");
    setNovoItemValor(0);
  };

  if (loading) return (
    <AppShell title="Planejamento">
      <div className="p-8 text-center text-muted">Carregando Simulador...</div>
    </AppShell>
  );

  return (
    <AppShell title={isNew ? "Novo Planejamento" : planejamento.titulo || "Detalhes do Planejamento"}>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/planejamento")} className="rounded-full px-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Ex: Comprar Carro" 
            value={planejamento.titulo}
            onChange={e => setPlanejamento({...planejamento, titulo: e.target.value})}
            className="text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted/50 w-full focus:ring-0"
          />
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button onClick={async () => {
              if (confirm("Isto criará os lançamentos (receitas/despesas) na sua conta e marcará este planejamento como concluído. Deseja continuar?")) {
                try {
                  const repo = new PlanejamentosRepository();
                  await repo.aplicarPlanejamento(planejamentoId);
                  alert("Planejamento aplicado com sucesso!");
                  router.push("/planejamento");
                } catch (e) {
                  console.error(e);
                  alert("Erro ao aplicar.");
                }
              }
            }} variant="secondary" className="rounded-full shadow-lg px-8 border-primary text-primary">
              Aplicar Planejamento
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="rounded-full shadow-lg px-8">
            {saving ? "Salvando..." : "Salvar Cenário"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1 & 2: Objetivo e Situação Atual */}
        <div className="space-y-8">
          
          <Card className="p-6 bg-surface border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              1. Objetivo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-muted block mb-1">Custo Total Desejado</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">US$</div>
                  <Input 
                    type="number" 
                    value={planejamento.valor_estimado || ""}
                    onChange={e => setPlanejamento({...planejamento, valor_estimado: Number(e.target.value)})}
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-semibold text-muted block mb-1">Data Alvo</label>
                <Input 
                  type="date" 
                  value={planejamento.data_prevista || ""}
                  onChange={e => setPlanejamento({...planejamento, data_prevista: e.target.value})}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-surface-secondary border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-500" />
              2. Situação Atual
            </h3>
            {simulacao && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Saldo Atual Familiar</span>
                  <span className="font-bold">{formatCurrency(simulacao.situacao_atual.saldo_atual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Média de Receitas</span>
                  <span className="font-bold text-emerald-500">{formatCurrency(simulacao.situacao_atual.media_receitas)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Média de Despesas</span>
                  <span className="font-bold text-danger">{formatCurrency(simulacao.situacao_atual.media_despesas)}</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-3">
                  <span className="font-semibold">Capacidade Segura (Sem Variáveis)</span>
                  <span className="font-black text-primary">{formatCurrency(simulacao.diagnostico.capacidade_mensal_segura_atual)} /mês</span>
                </div>
              </div>
            )}
          </Card>

          {/* Step 3: Estratégia */}
          <Card className="p-6 bg-surface border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-6">3. Estratégia (Simular Variáveis)</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={novoItemTipo === "nova_despesa_mensal" ? "primary" : "secondary"} onClick={() => setNovoItemTipo("nova_despesa_mensal")} className="text-xs">Nova Parcela/Despesa</Button>
                <Button variant={novoItemTipo === "nova_receita_mensal" ? "primary" : "secondary"} onClick={() => setNovoItemTipo("nova_receita_mensal")} className="text-xs">Nova Receita</Button>
                <Button variant={novoItemTipo === "despesa_unica" ? "primary" : "secondary"} onClick={() => setNovoItemTipo("despesa_unica")} className="text-xs">Gasto Único</Button>
                <Button variant={novoItemTipo === "reducao_despesa" ? "primary" : "secondary"} onClick={() => setNovoItemTipo("reducao_despesa")} className="text-xs">Cortar Despesa</Button>
              </div>

              <Input 
                placeholder="Ex: Parcela do Carro" 
                value={novoItemDescricao}
                onChange={e => setNovoItemDescricao(e.target.value)}
              />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">US$</div>
                <Input 
                  type="number" 
                  value={novoItemValor || ""}
                  onChange={e => setNovoItemValor(Number(e.target.value))}
                  className="pl-12"
                />
              </div>

              <Button onClick={handleAddItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Simular
              </Button>
            </div>

            <div className="space-y-3">
              {(planejamento.itens || []).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg border border-border-subtle">
                  <div>
                    <p className="font-bold text-sm">{item.descricao}</p>
                    <p className="text-xs text-muted capitalize">{item.tipo.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatCurrency(item.valor)}</span>
                    <button onClick={() => setPlanejamento(p => ({...p, itens: p.itens!.filter(i => i.id !== item.id)}))} className="text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Lado Direito: Diagnóstico e Projeção */}
        <div className="space-y-8">
          
          <Card className={`p-8 rounded-[2rem] shadow-sm border-2 ${simulacao?.diagnostico.viavel_na_data ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface border-border'}`}>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              4. Diagnóstico Inteligente
            </h3>
            {simulacao && (
              <div className="space-y-4">
                {simulacao.diagnostico.mensagens.map((msg, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    {msg.includes("inviável") || msg.includes("Atenção") || msg.includes("não é viável") ? (
                      <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    ) : msg.includes("viável") ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-semibold">{msg}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-surface border-border rounded-[2rem] shadow-sm overflow-hidden">
            <h3 className="font-bold text-lg mb-6">5. Projeção Cronológica (Próximos Meses)</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {simulacao?.projecao.slice(0, 12).map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg border border-border-subtle">
                  <div>
                    <p className="font-bold text-sm">{p.mes}</p>
                    <p className="text-xs text-muted">Saldo Projetado: <span className={p.saldo_final_projetado < 0 ? "text-danger" : ""}>{formatCurrency(p.saldo_final_projetado)}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">Economia: {formatCurrency(p.economia_possivel)}</p>
                    <p className="text-xs text-muted">Acumulado: {formatCurrency(p.objetivo_acumulado)}</p>
                  </div>
                </div>
              ))}
              {simulacao && simulacao.projecao.length > 12 && (
                <div className="text-center text-sm text-muted pt-2">
                  ... e mais {simulacao.projecao.length - 12} meses projetados.
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
      </div>
    </AppShell>
  );
}
