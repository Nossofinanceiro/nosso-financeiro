import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { orcamentoSchema, Orcamento } from "@/lib/schemas";

export class OrcamentosRepository {
  async getOrcamentosPorMes(familiaId: string, mesReferencia: string): Promise<Orcamento[]> {
    try {
      const supabase = createClient();
      const mesDate = mesReferencia.length === 7 ? `${mesReferencia}-01` : mesReferencia;

      const { data, error } = await supabase
        .from("orcamentos")
        .select("id, familia_id, categoria_id, mes_referencia, valor_limite, criado_em, atualizado_em")
        .eq("familia_id", familiaId)
        .eq("mes_referencia", mesDate);

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => orcamentoSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
