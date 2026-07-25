import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { Planejamento, PlanejamentoItem, planejamentoSchema, planejamentoItemSchema } from "@/lib/schemas";
import { z } from "zod";

export class PlanejamentosRepository {
  async getPlanejamentos(familiaId: string): Promise<Planejamento[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamentos")
        .select(`
          *,
          itens:planejamento_itens(*)
        `)
        .eq("familia_id", familiaId)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      return z.array(planejamentoSchema).parse(data || []);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getPlanejamento(id: string): Promise<Planejamento | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamentos")
        .select(`
          *,
          itens:planejamento_itens(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return planejamentoSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async createPlanejamento(planejamento: Omit<Planejamento, "id" | "criado_em" | "atualizado_em" | "itens">): Promise<Planejamento> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamentos")
        .insert(planejamento)
        .select()
        .single();

      if (error) throw error;
      return planejamentoSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updatePlanejamento(id: string, updates: Partial<Omit<Planejamento, "id" | "criado_em" | "atualizado_em" | "itens">>): Promise<Planejamento> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return planejamentoSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async deletePlanejamento(id: string): Promise<void> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("planejamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  // ITENS DO PLANEJAMENTO

  async createItem(item: Omit<PlanejamentoItem, "id" | "criado_em" | "atualizado_em">): Promise<PlanejamentoItem> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamento_itens")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return planejamentoItemSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updateItem(id: string, updates: Partial<Omit<PlanejamentoItem, "id" | "criado_em" | "atualizado_em" | "planejamento_id">>): Promise<PlanejamentoItem> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("planejamento_itens")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return planejamentoItemSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("planejamento_itens")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
