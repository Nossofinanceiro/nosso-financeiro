import { PlanejamentoClient } from "./planejamento-client";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planejamento | Nosso Financeiro",
  description: "Simule cenários financeiros futuros.",
};

export default async function PlanejamentoPage() {
  const authRepo = new AuthRepository();
  const user = await authRepo.getCurrentUser().catch(() => null);

  if (!user) {
    redirect("/login");
  }

  const familiaRepo = new FamiliaRepository();
  const familia = await familiaRepo.getFamiliaDoUsuario(user.id, user.nome);

  return <PlanejamentoClient familiaId={familia.id} />;
}
