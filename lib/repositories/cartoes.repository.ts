import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { cartaoCreditoSchema, CartaoCredito } from "@/lib/schemas";

export class CartoesRepository {
  async getCartoes(familiaId: string): Promise<CartaoCredito[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cartoes_credito")
        .select("id, familia_id, conta_pagamento_id, nome, instituicao, limite_credito, dia_fechamento, dia_vencimento, ativo, criado_em, atualizado_em")
        .eq("familia_id", familiaId)
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => cartaoCreditoSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
