import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { z } from "zod";
import { Despesa, Receita, despesaSchema, receitaSchema } from "@/lib/schemas";

export class PeriodForecastRepository {

  async getProximoPagamento(familiaId: string, aPartirDe: string): Promise<{ data: string; valor: number; descricao: string; pessoas: string[]; itens?: any[] } | null> {
    try {
      const supabase = createClient();
      
      // Busca receitas pendentes futuras com a categoria para identificar salário
      const { data: receitas, error: errorReceitas } = await supabase
        .from("receitas")
        .select("data_prevista, valor_previsto, descricao, pessoa, categorias(nome)")
        .eq("familia_id", familiaId)
        .eq("status", "pendente")
        .gte("data_prevista", aPartirDe)
        .order("data_prevista", { ascending: true });

      if (errorReceitas) throw errorReceitas;
      if (!receitas || receitas.length === 0) return null;

      // Procura a primeira data que possui uma receita de "Salário"
      let proximaData = null;
      for (const r of receitas) {
        const catName = (r.categorias as any)?.nome?.toLowerCase() || "";
        if (catName.includes("salário") || catName.includes("salario")) {
          proximaData = r.data_prevista;
          break;
        }
      }

      // Se não encontrou salário, pega a primeira data disponível (fallback)
      if (!proximaData) {
        proximaData = receitas[0].data_prevista;
      }

      if (!proximaData) return null;

      // Pega todas as receitas dessa data específica
      const receitasNoDia = receitas.filter((r: any) => r.data_prevista === proximaData);

      const valorTotal = receitasNoDia.reduce((acc: number, r: Record<string, unknown>) => acc + Number(r.valor_previsto), 0);
      const descricao = receitasNoDia.length === 1 
        ? receitasNoDia[0].descricao 
        : `${receitasNoDia.length} receitas combinadas`;
      
      const pessoas = receitasNoDia
        .map((r: any) => r.pessoa || "Geral")
        .filter((v: any, i: number, a: any[]) => a.indexOf(v) === i); // distinct

      const itens = receitasNoDia.map((r: any) => ({
        pessoa: r.pessoa || "Geral",
        valor: Number(r.valor_previsto),
        descricao: r.descricao,
      }));

      return {
        data: proximaData,
        valor: valorTotal,
        descricao,
        pessoas,
        itens,
      };
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getDespesasNoPeriodo(familiaId: string, dataFinal: string): Promise<Despesa[]> {
    try {
      const supabase = createClient();
      
      // Busca despesas pendentes/atrasadas com vencimento <= dataFinal
      const { data, error } = await supabase
        .from("despesas")
        .select("*, contas(*), categorias(*)")
        .eq("familia_id", familiaId)
        .in("status", ["pendente", "atrasada"])
        .lte("data_vencimento", dataFinal)
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      return z.array(despesaSchema).parse(data || []);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getReceitasNoPeriodo(familiaId: string, dataInicial: string, dataFinal: string): Promise<Receita[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("receitas")
        .select("*, contas(*), categorias(*)")
        .eq("familia_id", familiaId)
        .eq("status", "pendente")
        .gte("data_prevista", dataInicial)
        .lte("data_prevista", dataFinal)
        .order("data_prevista", { ascending: true });

      if (error) throw error;
      return z.array(receitaSchema).parse(data || []);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
