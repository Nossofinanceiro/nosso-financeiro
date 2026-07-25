import { createClient } from "@/lib/supabase/client";
import { AppError, parseSupabaseError } from "@/lib/errors/app-error";

export class AuthRepository {
  async getCurrentUser() {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new AppError("Usuário não autenticado.", "AUTH_REQUIRED");
      }

      return {
        id: user.id,
        email: user.email || "",
        nome: user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuário",
      };
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }

  async getSession() {
    try {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      return session;
    } catch (err) {
      throw parseSupabaseError(err);
    }
  }
}
