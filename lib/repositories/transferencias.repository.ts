import { createClient } from "@/lib/supabase/client";
import { parseSupabaseError } from "@/lib/errors/app-error";
import { transferenciaSchema, Transferencia } from "@/lib/schemas";

export class TransferenciasRepository {
  async getTransferencias(familiaId: string): Promise<Transferencia[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transferencias")
        .select("*")
        .eq("familia_id", familiaId)
        .order("data_transferencia", { ascending: false });

      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => transferenciaSchema.parse(item));
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getTransferenciaById(id: string): Promise<Transferencia | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transferencias")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return transferenciaSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async createTransferencia(transferencia: Omit<Transferencia, "id" | "criado_em">): Promise<Transferencia> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transferencias")
        .insert([transferencia])
        .select()
        .single();

      if (error) throw error;
      return transferenciaSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async updateTransferencia(id: string, updates: Partial<Omit<Transferencia, "id" | "familia_id" | "criado_em">>): Promise<Transferencia> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transferencias")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transferenciaSchema.parse(data);
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async deleteTransferencia(id: string): Promise<void> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transferencias")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
