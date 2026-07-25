import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import {
  resumoFinanceiroMensalSchema,
  ResumoFinanceiroMensal,
  despesaSchema,
  receitaSchema,
  Despesa,
  Receita,
} from "@/lib/schemas";

export class DashboardRepository {
  async getResumoMensal(familiaId: string, mesReferencia: string): Promise<ResumoFinanceiroMensal | null> {
    try {
      const supabase = createClient();
      const mesDate = mesReferencia.length === 7 ? `${mesReferencia}-01` : mesReferencia;

      const { data, error } = await supabase
        .from("resumo_financeiro_mensal")
        .select("familia_id, mes_referencia, total_receitas_previstas, total_receitas_recebidas, total_despesas_previstas, total_despesas_pagas, saldo_previsto, saldo_realizado, despesas_pendentes")
        .eq("familia_id", familiaId)
        .eq("mes_referencia", mesDate)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return resumoFinanceiroMensalSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getTotalReceitasPendentesAteMes(familiaId: string, mesReferencia: string): Promise<number> {
    try {
      const supabase = createClient();
      const mesDate = mesReferencia.length === 7 ? `${mesReferencia}-01` : mesReferencia;

      const { data, error } = await supabase
        .from("receitas")
        .select("valor_previsto")
        .eq("familia_id", familiaId)
        .lte("mes_referencia", mesDate)
        .eq("status", "pendente");

      if (error) throw error;
      return (data || []).reduce((acc: number, curr: Record<string, unknown>) => acc + Number(curr.valor_previsto), 0);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getTotalDespesasPendentesAteMes(familiaId: string, mesReferencia: string): Promise<number> {
    try {
      const supabase = createClient();
      const mesDate = mesReferencia.length === 7 ? `${mesReferencia}-01` : mesReferencia;

      const { data, error } = await supabase
        .from("despesas")
        .select("valor_previsto, valor_pago")
        .eq("familia_id", familiaId)
        .lte("mes_referencia", mesDate)
        .in("status", ["pendente", "atrasada"]);

      if (error) throw error;
      return (data || []).reduce((acc: number, curr: Record<string, unknown>) => {
        const val = curr.valor_pago !== null && curr.valor_pago !== undefined ? Number(curr.valor_pago) : Number(curr.valor_previsto);
        return acc + val;
      }, 0);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getProximasDespesas(familiaId: string, limit = 5): Promise<Despesa[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("despesas")
        .select("id, familia_id, categoria_id, conta_id, cartao_credito_id, descricao, valor_previsto, valor_pago, dia_vencimento, data_vencimento, data_pagamento, status, forma_pagamento, mes_referencia, recorrente, observacoes, criado_em, atualizado_em")
        .eq("familia_id", familiaId)
        .in("status", ["pendente", "atrasada"])
        .order("data_vencimento", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => despesaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getProximasReceitas(familiaId: string, limit = 5): Promise<Receita[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("receitas")
        .select("id, familia_id, categoria_id, conta_id, pessoa, descricao, dia_pagamento, valor_previsto, valor_recebido, status, data_prevista, data_recebimento, mes_referencia, recorrente, observacoes, criado_em, atualizado_em")
        .eq("familia_id", familiaId)
        .eq("status", "pendente")
        .order("data_recebimento", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => receitaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getProximoPagamentoDate(familiaId: string): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("proximo_pagamento", { familia_uuid: familiaId });
      if (error) throw error;
      return data ? String(data) : null;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getValorDisponivelAteProximoPagamento(familiaId: string): Promise<number> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("valor_disponivel_ate_proximo_pagamento", { familia_uuid: familiaId });
      if (error) throw error;
      return typeof data === "number" ? data : Number(data || 0);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
