import { PlanejamentoDetailClient } from "./planejamento-detail-client";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { PlanejamentosRepository } from "@/lib/repositories/planejamentos.repository";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulação de Planejamento | Nosso Financeiro",
  description: "Painel de controle para simulação financeira.",
};

export default async function PlanejamentoDetailPage({ params }: { params: { id: string } }) {
  const authRepo = new AuthRepository();
  const user = await authRepo.getCurrentUser().catch(() => null);

  if (!user) {
    redirect("/login");
  }

  const familiaRepo = new FamiliaRepository();
  const familia = await familiaRepo.getFamiliaDoUsuario(user.id, user.nome);

  const isNew = params.id === "novo";
  let planejamento = null;

  if (!isNew) {
    const planRepo = new PlanejamentosRepository();
    planejamento = await planRepo.getPlanejamento(params.id);
    if (!planejamento) {
      redirect("/planejamento");
    }
  }

  return <PlanejamentoDetailClient familiaId={familia.id} planejamento={planejamento} />;
}
