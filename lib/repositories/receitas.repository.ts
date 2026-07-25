import { createClient } from "@/lib/supabase/client";
import { Receita } from "@/lib/schemas";

export class ReceitasRepository {
  async findAll(familiaId: string, mesReferencia?: string): Promise<Receita[]> {
    const supabase = createClient();
    
    let query = supabase
      .from("receitas")
      .select("*, categorias(nome, icone, cor), contas(nome)")
      .eq("familia_id", familiaId)
      .order("data_prevista", { ascending: true });

    if (mesReferencia) {
      // Filtrar pelo mês exato no formato YYYY-MM-DD (geralmente primeiro dia do mês)
      query = query.eq("mes_referencia", mesReferencia);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar receitas: ${error.message}`);
    }

    return data as Receita[];
  }

  async findById(id: string, familiaId: string): Promise<Receita | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("receitas")
      .select("*")
      .eq("id", id)
      .eq("familia_id", familiaId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erro ao buscar receita: ${error.message}`);
    }

    return data as Receita;
  }

  async create(familiaId: string, data: Partial<Receita>): Promise<Receita> {
    const supabase = createClient();
    
    const { data: novaReceita, error } = await supabase
      .from("receitas")
      .insert([{ ...data, familia_id: familiaId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar receita: ${error.message}`);
    }

    return novaReceita as Receita;
  }

  async update(id: string, familiaId: string, data: Partial<Receita>): Promise<Receita> {
    const supabase = createClient();
    
    const { data: receitaAtualizada, error } = await supabase
      .from("receitas")
      .update(data)
      .eq("id", id)
      .eq("familia_id", familiaId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar receita: ${error.message}`);
    }

    return receitaAtualizada as Receita;
  }
}
