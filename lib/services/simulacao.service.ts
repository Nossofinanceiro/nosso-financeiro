import { createClient } from "@/lib/supabase/client";
import { Planejamento, PlanejamentoItem, DashboardData } from "@/lib/schemas";
import { DashboardService } from "./dashboard.service";
import { addMonths, format, parseISO, differenceInMonths, isBefore, isAfter, startOfMonth } from "date-fns";

export interface ProjecaoMes {
  mes: string; // YYYY-MM
  saldo_inicial: number;
  receitas_previstas: number;
  despesas_previstas: number;
  impacto_variaveis: number; // Sum of variables (Planejamento itens) for this month
  economia_possivel: number;
  saldo_final_projetado: number;
  objetivo_acumulado: number;
  orcamento_negativo: boolean;
}

export interface Diagnostico {
  viavel_na_data: boolean;
  data_realista: string | null;
  capacidade_mensal_segura_atual: number;
  capacidade_mensal_segura_apos_variaveis: number;
  valor_necessario_mensal: number;
  diferenca: number;
  menor_saldo_projetado: number;
  meses_negativos: number;
  mensagens: string[];
}

export interface SimulacaoResult {
  situacao_atual: {
    saldo_atual: number;
    media_receitas: number;
    media_despesas: number;
    sobra_estimada: number;
    margem_seguranca: number;
  };
  projecao: ProjecaoMes[];
  diagnostico: Diagnostico;
}

export class SimulacaoService {
  private dashboardService = new DashboardService();

  async gerarSimulacao(planejamento: Planejamento): Promise<SimulacaoResult> {
    const dashboard = await this.dashboardService.getDashboardConsolidado();
    const supabase = createClient();

    // 1. Fetch future data up to 60 months max to prevent infinite loops
    const today = new Date();
    const currentMonthStr = format(today, "yyyy-MM");
    const targetDate = planejamento.data_prevista ? parseISO(planejamento.data_prevista.toString()) : null;
    let monthsToProject = targetDate ? differenceInMonths(targetDate, today) + 1 : 24;
    
    if (monthsToProject <= 0) monthsToProject = 1;
    if (monthsToProject > 60) monthsToProject = 60; // Hard limit

    const { data: receitas } = await supabase
      .from("receitas")
      .select("valor_previsto, mes_referencia, recorrente")
      .eq("familia_id", planejamento.familia_id)
      .gte("mes_referencia", `${currentMonthStr}-01`);

    const { data: despesas } = await supabase
      .from("despesas")
      .select("valor_previsto, mes_referencia, recorrente")
      .eq("familia_id", planejamento.familia_id)
      .gte("mes_referencia", `${currentMonthStr}-01`);

    // Group by month
    const receitasPorMes: Record<string, number> = {};
    const despesasPorMes: Record<string, number> = {};
    const baseReceitasMensais = receitas?.filter((r: any) => r.recorrente).reduce((acc: any, curr: any) => acc + Number(curr.valor_previsto), 0) || dashboard.receitas_previstas;
    const baseDespesasMensais = despesas?.filter((d: any) => d.recorrente).reduce((acc: any, curr: any) => acc + Number(curr.valor_previsto), 0) || dashboard.despesas_previstas;

    receitas?.forEach((r: any) => {
      const m = String(r.mes_referencia).substring(0, 7);
      receitasPorMes[m] = (receitasPorMes[m] || 0) + Number(r.valor_previsto);
    });

    despesas?.forEach((d: any) => {
      const m = String(d.mes_referencia).substring(0, 7);
      despesasPorMes[m] = (despesasPorMes[m] || 0) + Number(d.valor_previsto);
    });

    const margemSegurancaPerc = Number(planejamento.margem_seguranca || 0.10);
    
    const situacao_atual = {
      saldo_atual: dashboard.saldo_atual,
      media_receitas: baseReceitasMensais,
      media_despesas: baseDespesasMensais,
      sobra_estimada: baseReceitasMensais - baseDespesasMensais,
      margem_seguranca: baseReceitasMensais * margemSegurancaPerc,
    };

    const capacidadeAtual = situacao_atual.sobra_estimada - situacao_atual.margem_seguranca;

    // 2. Build projection
    const projecao: ProjecaoMes[] = [];
    let saldoAtual = situacao_atual.saldo_atual;
    let objetivoAcumulado = Number(planejamento.valor_entrada || 0);
    
    let menorSaldo = saldoAtual;
    let mesesNegativos = 0;
    
    let currentIterDate = today;

    const itens = planejamento.itens || [];

    for (let i = 0; i < monthsToProject; i++) {
      const mesStr = format(currentIterDate, "yyyy-MM");
      
      // Use exact future data if exists, fallback to recurring baseline
      const rec = receitasPorMes[mesStr] !== undefined ? receitasPorMes[mesStr] : baseReceitasMensais;
      const des = despesasPorMes[mesStr] !== undefined ? despesasPorMes[mesStr] : baseDespesasMensais;

      // Apply variables
      let impactoVar = 0;
      itens.forEach(item => {
        let aplicar = false;
        if (item.recorrencia === "mensal") {
          // starts at data_inicial, ends at data_final (if provided)
          const di = item.data_inicial ? parseISO(String(item.data_inicial)) : today;
          const df = item.data_final ? parseISO(String(item.data_final)) : null;
          if (!isBefore(currentIterDate, startOfMonth(di)) && (!df || !isAfter(currentIterDate, df))) {
            aplicar = true;
          }
        } else if (item.recorrencia === "unica") {
          const di = item.data_inicial ? parseISO(String(item.data_inicial)) : today;
          if (format(di, "yyyy-MM") === mesStr) {
            aplicar = true;
          }
        }

        if (aplicar) {
          const v = Number(item.valor);
          switch (item.tipo) {
            case "nova_receita_mensal":
            case "receita_unica":
            case "reducao_despesa":
            case "entrada":
              impactoVar += v;
              break;
            case "nova_despesa_mensal":
            case "despesa_unica":
            case "parcelamento":
            case "saida":
              impactoVar -= v;
              break;
          }
        }
      });

      const economiaMes = rec - des - (rec * margemSegurancaPerc) + impactoVar;
      const saldoFinal = saldoAtual + rec - des + impactoVar;

      if (economiaMes > 0) {
        objetivoAcumulado += economiaMes;
      }

      projecao.push({
        mes: mesStr,
        saldo_inicial: saldoAtual,
        receitas_previstas: rec,
        despesas_previstas: des,
        impacto_variaveis: impactoVar,
        economia_possivel: economiaMes,
        saldo_final_projetado: saldoFinal,
        objetivo_acumulado: objetivoAcumulado,
        orcamento_negativo: saldoFinal < 0
      });

      if (saldoFinal < menorSaldo) menorSaldo = saldoFinal;
      if (saldoFinal < 0) mesesNegativos++;

      saldoAtual = saldoFinal;
      currentIterDate = addMonths(currentIterDate, 1);
    }

    // 3. Diagnostics
    const valorNecessario = (Number(planejamento.valor_estimado) - Number(planejamento.valor_entrada || 0)) / (monthsToProject || 1);
    const varMediaMensal = projecao.reduce((acc, p) => acc + p.impacto_variaveis, 0) / (projecao.length || 1);
    const capacidadeAposVariaveis = capacidadeAtual + varMediaMensal;
    
    let viavel = false;
    let dataRealista = null;

    if (objetivoAcumulado >= Number(planejamento.valor_estimado)) {
      viavel = true;
      // Find the exact month it was reached
      const mesAlcancado = projecao.find(p => p.objetivo_acumulado >= Number(planejamento.valor_estimado));
      if (mesAlcancado) dataRealista = mesAlcancado.mes;
    } else {
      if (capacidadeAposVariaveis > 0) {
        const faltante = Number(planejamento.valor_estimado) - objetivoAcumulado;
        const mesesAdicionais = Math.ceil(faltante / capacidadeAposVariaveis);
        dataRealista = format(addMonths(currentIterDate, mesesAdicionais), "yyyy-MM");
      }
    }

    const mensagens = [];
    if (!viavel) {
      mensagens.push(`A data desejada não é viável com a situação atual e variáveis aplicadas.`);
      if (dataRealista) {
        mensagens.push(`Neste ritmo, o objetivo seria alcançado em aproximadamente ${dataRealista}.`);
      } else {
        mensagens.push(`Sem mudanças no orçamento, este objetivo nunca será alcançado.`);
      }
      const dif = valorNecessario - capacidadeAposVariaveis;
      if (dif > 0) {
        mensagens.push(`Para alcançar no prazo estipulado, seria necessário aumentar receitas ou reduzir despesas em aproximadamente ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dif)} por mês.`);
      }
    } else {
      mensagens.push(`O objetivo é viável dentro do prazo estipulado!`);
    }

    if (capacidadeAtual !== capacidadeAposVariaveis) {
      const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
      mensagens.push(`Depois das variáveis aplicadas, a capacidade segura de economia muda de ${formatCurrency(capacidadeAtual)} para ${formatCurrency(capacidadeAposVariaveis)} por mês.`);
    }

    if (mesesNegativos > 0) {
      mensagens.push(`Atenção: Assumir este cenário deixará o orçamento negativo em ${mesesNegativos} meses projetados.`);
    }

    return {
      situacao_atual,
      projecao,
      diagnostico: {
        viavel_na_data: viavel,
        data_realista: dataRealista,
        capacidade_mensal_segura_atual: capacidadeAtual,
        capacidade_mensal_segura_apos_variaveis: capacidadeAposVariaveis,
        valor_necessario_mensal: valorNecessario,
        diferenca: valorNecessario - capacidadeAposVariaveis,
        menor_saldo_projetado: menorSaldo,
        meses_negativos: mesesNegativos,
        mensagens
      }
    };
  }
}
