"use client";

import React, { useEffect, useState } from "react";
import { PlanejamentoClient } from "./planejamento-client";
import { AuthRepository } from "@/lib/repositories/auth.repository";
import { FamiliaRepository } from "@/lib/repositories/familia.repository";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/page-loading";
import { AppShell } from "@/components/layout/app-shell";

export default function PlanejamentoPage() {
  const router = useRouter();
  const [familiaId, setFamiliaId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const authRepo = new AuthRepository();
        const user = await authRepo.getCurrentUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        const familiaRepo = new FamiliaRepository();
        const familia = await familiaRepo.getFamiliaDoUsuario(user.id, user.nome);
        setFamiliaId(familia.id);
      } catch (error) {
        console.error("Error loading user or family", error);
        router.push("/login");
      }
    }
    
    loadUser();
  }, [router]);

  if (!familiaId) {
    return (
      <AppShell title="Planejamento">
        <PageLoading />
      </AppShell>
    );
  }

  return <PlanejamentoClient familiaId={familiaId} />;
}
