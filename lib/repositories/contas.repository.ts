import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { contaSchema, Conta } from "@/lib/schemas";

export class ContasRepository {
  async getContas(familiaId: string): Promise<Conta[]> {
    try {
      const supabase = createClient();
      const [contasResult, movsResult] = await Promise.all([
        supabase
          .from("contas")
          .select("id, familia_id, nome, tipo, instituicao, saldo_inicial, ativa, criado_em, atualizado_em")
          .eq("familia_id", familiaId)
          .order("nome", { ascending: true }),
        supabase
          .from("movimentacoes")
          .select("conta_id, valor, tipo")
          .eq("familia_id", familiaId)
      ]);

      if (contasResult.error) throw contasResult.error;
      if (movsResult.error) throw movsResult.error;

      const balancoMap = new Map<string, number>();
      for (const m of (movsResult.data || [])) {
        if (!m.conta_id) continue;
        const diff = m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor);
        balancoMap.set(m.conta_id, (balancoMap.get(m.conta_id) || 0) + diff);
      }

      return (contasResult.data || []).map((item: Record<string, unknown>) => {
        const saldo_movimentacoes = balancoMap.get(item.id as string) || 0;
        return contaSchema.parse({ ...item, saldo_atual: Number(item.saldo_inicial) + saldo_movimentacoes });
      });
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getContaPorId(familiaId: string, contaId: string): Promise<Conta | null> {
    try {
      const supabase = createClient();
      const [contaResult, movsResult] = await Promise.all([
        supabase
          .from("contas")
          .select("id, familia_id, nome, tipo, instituicao, saldo_inicial, ativa, criado_em, atualizado_em")
          .eq("familia_id", familiaId)
          .eq("id", contaId)
          .maybeSingle(),
        supabase
          .from("movimentacoes")
          .select("valor, tipo")
          .eq("familia_id", familiaId)
          .eq("conta_id", contaId)
      ]);

      if (contaResult.error) throw contaResult.error;
      if (!contaResult.data) return null;
      if (movsResult.error) throw movsResult.error;

      let saldo_movimentacoes = 0;
      for (const m of (movsResult.data || [])) {
        saldo_movimentacoes += (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor));
      }

      return contaSchema.parse({ ...contaResult.data, saldo_atual: Number(contaResult.data.saldo_inicial) + saldo_movimentacoes });
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async createConta(familiaId: string, data: Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">): Promise<Conta> {
    try {
      const supabase = createClient();
      const insertData = {
        familia_id: familiaId,
        nome: data.nome,
        tipo: data.tipo,
        saldo_inicial: data.saldo_inicial,
        ativa: data.ativa ?? true,
        instituicao: data.observacoes || null // Mapping any color or obs to instituicao/observacoes if needed. Actually just sending what DB needs
      };

      const { data: result, error } = await supabase
        .from("contas")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return contaSchema.parse({ ...result, saldo_atual: result.saldo_inicial });
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updateConta(familiaId: string, contaId: string, data: Partial<Omit<Conta, "id" | "familia_id" | "criado_em" | "atualizado_em" | "saldo_atual">>): Promise<Conta> {
    try {
      const supabase = createClient();
      
      const updateData: Record<string, unknown> = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.saldo_inicial !== undefined) updateData.saldo_inicial = data.saldo_inicial;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const { data: result, error } = await supabase
        .from("contas")
        .update(updateData)
        .eq("familia_id", familiaId)
        .eq("id", contaId)
        .select()
        .single();

      if (error) throw error;
      return contaSchema.parse({ ...result, saldo_atual: result.saldo_inicial });
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async deleteConta(familiaId: string, contaId: string): Promise<void> {
    try {
      const supabase = createClient();
      
      // Desvincular de tabelas relacionadas (Workaround para erro do PG com FK composta + SET NULL)
      await Promise.all([
        supabase.from("despesas").update({ conta_id: null }).eq("familia_id", familiaId).eq("conta_id", contaId),
        supabase.from("receitas").update({ conta_id: null }).eq("familia_id", familiaId).eq("conta_id", contaId),
        supabase.from("movimentacoes").update({ conta_id: null }).eq("familia_id", familiaId).eq("conta_id", contaId),
        supabase.from("metas").update({ conta_id: null }).eq("familia_id", familiaId).eq("conta_id", contaId),
        supabase.from("recorrencias").update({ conta_id: null }).eq("familia_id", familiaId).eq("conta_id", contaId),
      ]);

      const { error } = await supabase
        .from("contas")
        .delete()
        .eq("familia_id", familiaId)
        .eq("id", contaId);

      if (error) throw error;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}

