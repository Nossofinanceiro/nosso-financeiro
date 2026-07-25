import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { despesaSchema, Despesa } from "@/lib/schemas";

export class DespesasRepository {
  async getDespesasByMes(familiaId: string, mesReferencia: string): Promise<Despesa[]> {
    try {
      const supabase = createClient();
      const mesDate = mesReferencia.length === 7 ? `${mesReferencia}-01` : mesReferencia;
      
      const { data, error } = await supabase
        .from("despesas")
        .select(`
          *,
          categorias (id, nome, icone, cor, tipo),
          contas (id, nome)
        `)
        .eq("familia_id", familiaId)
        .eq("mes_referencia", mesDate)
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      
      return data as Despesa[];
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getDespesasPendentes(familiaId: string): Promise<Despesa[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("despesas")
        .select(`
          *,
          categorias (id, nome, icone, cor, tipo),
          contas (id, nome)
        `)
        .eq("familia_id", familiaId)
        .in("status", ["pendente", "atrasada"])
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      
      return data as Despesa[];
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getDespesaById(id: string): Promise<Despesa | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("despesas")
        .select(`
          *,
          categorias (id, nome, icone, cor, tipo),
          contas (id, nome)
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data as Despesa;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async createDespesa(despesa: Partial<Despesa>): Promise<Despesa> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("despesas")
        .insert([despesa])
        .select()
        .single();

      if (error) throw error;
      return data as Despesa;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updateDespesa(id: string, updates: Partial<Despesa>): Promise<Despesa> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("despesas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Despesa;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async deleteDespesa(id: string): Promise<void> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("despesas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
