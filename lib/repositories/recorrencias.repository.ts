import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { recorrenciaSchema, Recorrencia } from "@/lib/schemas";

export class RecorrenciasRepository {
  async getRecorrencias(familiaId: string): Promise<Recorrencia[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("recorrencias")
        .select("id, familia_id, tipo, descricao, pessoa, categoria_id, conta_id, cartao_credito_id, dia, data_inicio, data_fim, valor_padrao, ativa, criado_em")
        .eq("familia_id", familiaId)
        .eq("ativa", true);

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => recorrenciaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
