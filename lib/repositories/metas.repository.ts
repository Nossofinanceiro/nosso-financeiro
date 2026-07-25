import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { metaSchema, Meta } from "@/lib/schemas";

export class MetasRepository {
  async getMetas(familiaId: string): Promise<Meta[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("metas")
        .select("id, familia_id, conta_id, nome, valor_meta, valor_atual, data_limite, status, criado_em, atualizado_em")
        .eq("familia_id", familiaId)
        .order("status", { ascending: true });

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => metaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
