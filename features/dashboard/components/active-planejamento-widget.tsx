"use client";

import React, { useEffect, useState } from "react";
import { Planejamento } from "@/lib/schemas";
import { PlanejamentosRepository } from "@/lib/repositories/planejamentos.repository";
import { Card } from "@/components/ui/card";
import { Target, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  familiaId: string;
}

export function ActivePlanejamentoWidget({ familiaId }: Props) {
  const [activePlan, setActivePlan] = useState<Planejamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const repo = new PlanejamentosRepository();
        const plans = await repo.getPlanejamentos(familiaId);
        // Find the first active plan
        const active = plans.find(p => p.status === "ativo");
        if (active) {
          setActivePlan(active);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [familiaId]);

  if (loading || !activePlan) return null; // Don't show anything if no active plan or loading

  return (
    <Link href={`/planejamento/${activePlan.id}`} className="block group">
      <Card className="p-4 bg-primary text-primary-foreground rounded-[1.5rem] shadow-lg flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 mb-0.5">Planejamento Ativo</p>
            <p className="text-lg font-bold">{activePlan.titulo}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-primary-foreground/80 mb-0.5">Valor Estimado</p>
            <p className="font-bold">{formatCurrency(activePlan.valor_estimado)}</p>
          </div>
          {activePlan.data_prevista && (
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-primary-foreground/80 mb-0.5">Data Alvo</p>
              <p className="font-bold">{format(new Date(activePlan.data_prevista), "MMM yyyy", { locale: ptBR })}</p>
            </div>
          )}
          <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
