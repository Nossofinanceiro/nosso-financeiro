"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!nome.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Cadastrar usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: nome.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Este e-mail já está cadastrado.");
        } else {
          setError(signUpError.message || "Erro ao realizar cadastro.");
        }
        setLoading(false);
        return;
      }

      // Se a sessão já estiver ativa imediatamente
      if (signUpData.session) {
        const { data: novaFamiliaId } = await supabase.rpc("criar_familia", {
          nome_familia: "Família Lima",
          nome_usuario: nome.trim(),
        });

        if (novaFamiliaId) {
          await supabase.rpc("configurar_familia_inicial", {
            familia_uuid: novaFamiliaId,
          });
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Se a sessão não estiver ativa (ex: confirmação por e-mail ou fluxo assíncrono)
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      console.error("Erro inesperado no cadastro:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface/80 border border-border backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mb-6 flex flex-col items-center justify-center">
            <img src="/logo2.png" alt="Nosso Financeiro" className="h-20 object-contain dark:hidden" />
            <img src="/logo.png" alt="Nosso Financeiro" className="h-20 object-contain hidden dark:block" />
          </div>
          <p className="text-sm text-muted">
            Cadastre-se para gerenciar o controle financeiro
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-foreground"
            >
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="No mínimo 6 caracteres"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground"
            >
              Confirmação de senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua senha"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-foreground font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Criando conta...</span>
              </>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted pt-2 border-t border-border/80">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
