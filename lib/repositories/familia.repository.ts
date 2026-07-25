import { createClient } from "@/lib/supabase/client";
import { AppError, parseSupabaseError } from "@/lib/errors/app-error";
import { familiaSchema, Familia } from "@/lib/schemas";

export class FamiliaRepository {
  async getFamiliaDoUsuario(usuarioId: string, nomeUsuario = "Usuário"): Promise<Familia> {
    try {
      const supabase = createClient();

      // 1. Busca todos os vinculos em membros_familia para este usuarioId
      const { data: membros, error: membroErr } = await supabase
        .from("membros_familia")
        .select("familia_id")
        .eq("usuario_id", usuarioId)
        .order("criado_em", { ascending: false });

      if (membroErr) throw membroErr;

      // 2. Se encontrar vinculos, busca a família correspondente na tabela familias
      if (membros && membros.length > 0) {
        for (const membro of membros) {
          if (!membro.familia_id) continue;
          const { data: fam, error: famErr } = await supabase
            .from("familias")
            .select("id, nome, moeda, fuso_horario, criado_em, atualizado_em")
            .eq("id", membro.familia_id)
            .maybeSingle();

          if (!famErr && fam) {
            return familiaSchema.parse(fam);
          }
        }
      }

      // 3. Se nenhuma família válida for localizada, INICIALIZA AUTOMATICAMENTE VIA RPCs
      const { data: novaFamiliaId, error: rpcCriarError } = await supabase.rpc(
        "criar_familia",
        {
          nome_familia: "Família Lima",
          nome_usuario: nomeUsuario && nomeUsuario.trim() ? nomeUsuario.trim() : "Usuário",
        }
      );

      if (rpcCriarError) throw rpcCriarError;

      if (novaFamiliaId) {
        await supabase.rpc("configurar_familia_inicial", {
          familia_uuid: novaFamiliaId,
        });

        // 4. Busca diretamente a família recém-criada por ID
        const { data: famNova, error: errNova } = await supabase
          .from("familias")
          .select("id, nome, moeda, fuso_horario, criado_em, atualizado_em")
          .eq("id", novaFamiliaId)
          .single();

        if (errNova) throw errNova;
        if (famNova) {
          return familiaSchema.parse(famNova);
        }
      }

      throw new AppError("Família não encontrada para o usuário.", "FAMILY_NOT_FOUND");
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
