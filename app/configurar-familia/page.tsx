"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Landmark, ArrowRight } from "lucide-react";

export default function ConfigurarFamiliaPage() {
  const router = useRouter();
  const [nomeFamilia, setNomeFamilia] = React.useState("Família Lima");
  const [nomeUsuario, setNomeUsuario] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fetchingUser, setFetchingUser] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const name =
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          "";
        setNomeUsuario(name);

        // Check if user already has a family
        const { data: membro } = await supabase
          .from("membros_familia")
          .select("id")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (membro) {
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setFetchingUser(false);
      }
    }

    loadUser();
  }, [router]);

  const handleConfigurar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomeFamilia.trim()) {
      setError("Por favor, informe o nome da família.");
      return;
    }

    if (!nomeUsuario.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Criar família via RPC
      const { data: novaFamiliaId, error: rpcCriarError } = await supabase.rpc(
        "criar_familia",
        {
          nome_familia: nomeFamilia.trim(),
          nome_usuario: nomeUsuario.trim(),
        }
      );

      if (rpcCriarError) {
        console.error("Erro ao criar família:", rpcCriarError);
        setError("Não foi possível criar a estrutura familiar. Tente novamente.");
        setLoading(false);
        return;
      }

      // 2. Configurar estrutura inicial via RPC
      if (novaFamiliaId) {
        const { error: rpcConfigError } = await supabase.rpc(
          "configurar_familia_inicial",
          {
            familia_uuid: novaFamiliaId,
          }
        );

        if (rpcConfigError) {
          console.error("Erro ao configurar família inicial:", rpcConfigError);
        }
      }

      // 3. Sucesso -> redirecionar ao Dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Erro inesperado na configuração:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Verificando dados da conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mb-6 flex flex-col items-center justify-center">
            <img src="/logo.png" alt="Nosso Financeiro" className="h-20 object-contain" />
          </div>
          <p className="text-sm text-gray-400">
            Vamos finalizar a configuração da sua família para dar início ao controle financeiro.
          </p>
        </div>

        {error && (
          <Alert variant="danger" title="Erro na Configuração">
            {error}
          </Alert>
        )}

        <form onSubmit={handleConfigurar} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nomeFamilia" className="block text-sm font-medium text-gray-300">
              Nome da Família
            </label>
            <Input
              id="nomeFamilia"
              type="text"
              required
              value={nomeFamilia}
              onChange={(e) => setNomeFamilia(e.target.value)}
              placeholder="Ex: Família Lima"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-300">
              Seu Nome de Exibição
            </label>
            <Input
              id="nomeUsuario"
              type="text"
              required
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full py-3 text-base font-semibold"
          >
            {loading ? (
              <span>Inicializando...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Concluir Configuração
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
