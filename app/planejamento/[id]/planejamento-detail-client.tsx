"use client";

import React, { useState } from "react";
import { Planejamento, PlanejamentoItem } from "@/lib/schemas";
import { PlanejamentosRepository } from "@/lib/repositories/planejamentos.repository";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Target, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Plane, Car, Home, GraduationCap, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { differenceInMonths } from "date-fns";

interface Props {
  familiaId: string;
  planejamento: Planejamento | null;
}

export function PlanejamentoDetailClient({ familiaId, planejamento }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isNew = !planejamento;

  // Form states for Plan
  const [titulo, setTitulo] = useState(planejamento?.titulo || "");
  const [descricao, setDescricao] = useState(planejamento?.descricao || "");
  const [valorEstimado, setValorEstimado] = useState(planejamento?.valor_estimado || 0);
  const [dataPrevista, setDataPrevista] = useState(planejamento?.data_prevista || "");
  const [status, setStatus] = useState(planejamento?.status || "ativo");

  // Items
  const [itens, setItens] = useState<PlanejamentoItem[]>(planejamento?.itens || []);
  
  // New Item State
  const [novoItemDescricao, setNovoItemDescricao] = useState("");
  const [novoItemValor, setNovoItemValor] = useState(0);
  const [novoItemTipo, setNovoItemTipo] = useState<"entrada" | "saida">("saida");
  const [novoItemMensal, setNovoItemMensal] = useState(true);

  // Cálculos matemáticos da Simulação
  const entradas = itens.filter(i => i.tipo === "entrada");
  const saidas = itens.filter(i => i.tipo === "saida");

  const impactoMensal = 
    entradas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0) - 
    saidas.filter(i => i.mensal).reduce((acc, i) => acc + i.valor, 0);

  const impactoAVista = 
    entradas.filter(i => !i.mensal).reduce((acc, i) => acc + i.valor, 0) - 
    saidas.filter(i => !i.mensal).reduce((acc, i) => acc + i.valor, 0);

  const totalAtingido = impactoAVista; // Todo dinheiro que entra/sai à vista vai para abater o valor estimado
  const restante = Math.max(0, valorEstimado - totalAtingido);

  let mesesRestantes = 0;
  if (impactoMensal > 0 && restante > 0) {
    mesesRestantes = Math.ceil(restante / impactoMensal);
  }

  // Previsão em Meses (Data Prevista vs Hoje)
  const mesesAteAlvo = dataPrevista ? differenceInMonths(new Date(dataPrevista), new Date()) : 0;

  const handleSave = async () => {
    if (!titulo) return alert("Preencha o título");
    setLoading(true);
    try {
      const repo = new PlanejamentosRepository();
      let savedPlan: Planejamento;
      if (isNew) {
        savedPlan = await repo.createPlanejamento({
          familia_id: familiaId,
          titulo,
          descricao,
          valor_estimado: valorEstimado,
          data_prevista: dataPrevista || undefined,
          status: status as any,
          prioridade: "media"
        });
      } else {
        savedPlan = await repo.updatePlanejamento(planejamento!.id, {
          titulo,
          descricao,
          valor_estimado: valorEstimado,
          data_prevista: dataPrevista || undefined,
          status: status as any
        });
      }

      // Salvar Itens (Simplificado: recria tudo)
      if (!isNew) {
        for (const item of planejamento!.itens || []) {
          await repo.deleteItem(item.id);
        }
      }
      for (const item of itens) {
        await repo.createItem({
          planejamento_id: savedPlan.id,
          tipo: item.tipo,
          descricao: item.descricao,
          valor: item.valor,
          mensal: item.mensal
        });
      }

      router.push("/planejamento");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cenário");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!novoItemDescricao || novoItemValor <= 0) return;
    const newItem: PlanejamentoItem = {
      id: crypto.randomUUID(), // Temp ID
      planejamento_id: "",
      tipo: novoItemTipo,
      descricao: novoItemDescricao,
      valor: novoItemValor,
      mensal: novoItemMensal
    };
    setItens([...itens, newItem]);
    setNovoItemDescricao("");
    setNovoItemValor(0);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/planejamento")} className="rounded-full px-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Ex: Viagem para Europa 2027" 
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted/50 w-full focus:ring-0"
          />
        </div>
        <Button onClick={handleSave} disabled={loading} className="rounded-full shadow-lg px-8">
          {loading ? "Salvando..." : "Salvar Cenário"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Variáveis do Cenário (Painel de Avião) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-surface border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Alvo do Cenário
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Custo Estimado do Sonho</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">US$</div>
                  <Input 
                    type="number" 
                    value={valorEstimado || ""}
                    onChange={e => setValorEstimado(Number(e.target.value))}
                    className="pl-12 bg-surface-secondary border-border-subtle"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted block mb-1">Data Desejada</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <Input 
                    type="date" 
                    value={dataPrevista}
                    onChange={e => setDataPrevista(e.target.value)}
                    className="pl-10 bg-surface-secondary border-border-subtle"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-surface border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-6">Adicionar Variáveis</h3>
            <div className="space-y-4">
              <div className="flex bg-surface-secondary p-1 rounded-xl">
                <button 
                  onClick={() => setNovoItemTipo("saida")}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${novoItemTipo === "saida" ? "bg-danger text-white shadow-sm" : "text-muted hover:text-foreground"}`}
                >
                  Saída (-)
                </button>
                <button 
                  onClick={() => setNovoItemTipo("entrada")}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${novoItemTipo === "entrada" ? "bg-emerald-500 text-white shadow-sm" : "text-muted hover:text-foreground"}`}
                >
                  Entrada (+)
                </button>
              </div>

              <div>
                <Input 
                  placeholder="Ex: Parcela do Carro" 
                  value={novoItemDescricao}
                  onChange={e => setNovoItemDescricao(e.target.value)}
                  className="bg-surface-secondary border-border-subtle"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">US$</div>
                <Input 
                  type="number" 
                  value={novoItemValor || ""}
                  onChange={e => setNovoItemValor(Number(e.target.value))}
                  className="pl-12 bg-surface-secondary border-border-subtle"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-border-subtle">
                <span className="text-sm font-semibold">É um valor mensal?</span>
                <input 
                  type="checkbox" 
                  checked={novoItemMensal} 
                  onChange={e => setNovoItemMensal(e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
              </div>

              <Button onClick={handleAddItem} className="w-full rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Variável
              </Button>
            </div>
          </Card>
        </div>

        {/* Lado Direito: Visualização do Cenário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard do Simulador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-8 bg-surface border-border rounded-[2rem] shadow-sm flex flex-col justify-center text-center">
              <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Impacto Mensal no Orçamento</p>
              <p className={`text-5xl font-black ${impactoMensal < 0 ? 'text-danger' : impactoMensal > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                {impactoMensal > 0 ? '+' : ''}{formatCurrency(impactoMensal)}
              </p>
              <p className="text-sm text-muted mt-3">
                {impactoMensal < 0 ? "Você precisará tirar este valor do seu bolso todo mês." : impactoMensal > 0 ? "Você vai gerar este valor de sobra todo mês." : "Nenhum impacto mensal gerado."}
              </p>
            </Card>

            <Card className="p-8 bg-surface-secondary border-border rounded-[2rem] shadow-sm flex flex-col justify-center text-center relative overflow-hidden">
              <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Tempo para atingir o Alvo</p>
              {restante === 0 && valorEstimado > 0 ? (
                <p className="text-4xl font-black text-emerald-500">Alvo Atingido!</p>
              ) : impactoMensal > 0 && restante > 0 ? (
                <>
                  <p className="text-5xl font-black text-primary">{mesesRestantes} meses</p>
                  <p className="text-sm text-muted mt-3">Com a sobra gerada, você chega lá em {mesesRestantes} meses.</p>
                </>
              ) : restante > 0 ? (
                <>
                  <p className="text-3xl font-black text-danger">Faltam {formatCurrency(restante)}</p>
                  <p className="text-sm text-muted mt-3">Aumente suas entradas mensais para gerar sobra.</p>
                </>
              ) : (
                <p className="text-xl font-bold text-muted">Defina um valor estimado para calcular.</p>
              )}
            </Card>
          </div>

          {/* Lista de Variáveis Adicionadas */}
          <Card className="p-6 md:p-8 bg-surface border-border rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg mb-6 border-b border-border-subtle pb-4">Variáveis no Cenário ({itens.length})</h3>
            
            {itens.length === 0 ? (
              <div className="text-center py-8 text-muted">
                Nenhuma variável adicionada. Adicione as entradas e saídas que fazem parte deste plano.
              </div>
            ) : (
              <div className="space-y-4">
                {itens.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center p-4 bg-surface-secondary rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.tipo === "entrada" ? "bg-emerald-500/10 text-emerald-500" : "bg-danger/10 text-danger"}`}>
                        {item.tipo === "entrada" ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{item.descricao}</p>
                        <p className="text-xs text-muted font-semibold">{item.mensal ? "Recorrente Mensal" : "Valor Único à vista"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-black text-lg ${item.tipo === "entrada" ? "text-emerald-500" : "text-danger"}`}>
                        {item.tipo === "entrada" ? "+" : "-"}{formatCurrency(item.valor)}
                      </p>
                      <button 
                        onClick={() => setItens(itens.filter(i => i.id !== item.id))}
                        className="p-2 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
