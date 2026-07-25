import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { categoriaSchema, Categoria } from "@/lib/schemas";

export class CategoriasRepository {
  async getCategorias(familiaId: string): Promise<Categoria[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categorias")
        .select("id, familia_id, nome, tipo, icone, cor, categoria_sistema, ativa, criado_em")
        .or(`familia_id.eq.${familiaId},categoria_sistema.eq.true`)
        .order("nome", { ascending: true });

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => categoriaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async createCategoria(familiaId: string, data: Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">): Promise<Categoria> {
    try {
      const supabase = createClient();
      const { data: categoria, error } = await supabase
        .from("categorias")
        .insert([{ ...data, familia_id: familiaId, categoria_sistema: false }])
        .select()
        .single();

      if (error) throw error;
      return categoriaSchema.parse(categoria);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updateCategoria(
    familiaId: string,
    categoriaId: string,
    data: Partial<Omit<Categoria, "id" | "familia_id" | "criado_em" | "categoria_sistema">>
  ): Promise<Categoria> {
    try {
      const supabase = createClient();
      const { data: categoria, error } = await supabase
        .from("categorias")
        .update(data)
        .eq("id", categoriaId)
        .eq("familia_id", familiaId)
        .select()
        .single();

      if (error) throw error;
      return categoriaSchema.parse(categoria);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
