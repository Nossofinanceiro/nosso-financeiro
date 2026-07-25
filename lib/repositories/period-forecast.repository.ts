import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { z } from "zod";
import { Despesa, Receita, despesaSchema, receitaSchema } from "@/lib/schemas";

export class PeriodForecastRepository {

  async getProximoPagamento(familiaId: string, aPartirDe: string): Promise<{ data: string; valor: number; descricao: string } | null> {
    try {
      const supabase = createClient();
      
      // Encontra a primeira data de receita pendente >= aPartirDe
      const { data: proximaReceitaData, error: errorData } = await supabase
        .from("receitas")
        .select("data_prevista")
        .eq("familia_id", familiaId)
        .eq("status", "pendente")
        .gte("data_prevista", aPartirDe)
        .order("data_prevista", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (errorData) throw errorData;
      if (!proximaReceitaData || !proximaReceitaData.data_prevista) return null;

      const proximaData = proximaReceitaData.data_prevista;

      // Busca TODAS as receitas pendentes nessa data
      const { data: receitasNoDia, error: errorReceitas } = await supabase
        .from("receitas")
        .select("descricao, valor_previsto")
        .eq("familia_id", familiaId)
        .eq("status", "pendente")
        .eq("data_prevista", proximaData);

      if (errorReceitas) throw errorReceitas;

      if (!receitasNoDia || receitasNoDia.length === 0) return null;

      const valorTotal = receitasNoDia.reduce((acc: number, r: Record<string, unknown>) => acc + Number(r.valor_previsto), 0);
      const descricao = receitasNoDia.length === 1 
        ? receitasNoDia[0].descricao 
        : `${receitasNoDia.length} receitas combinadas`;

      return {
        data: proximaData,
        valor: valorTotal,
        descricao,
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
