import { Despesa } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, Wallet, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DespesasSummaryProps {
  despesas: Despesa[];
  isLoading?: boolean;
}

export function DespesasSummary({ despesas, isLoading }: DespesasSummaryProps) {
  // Calculando totais
  const validDespesas = despesas.filter((d) => d.status !== "cancelada");
  
  const totalPrevisto = validDespesas.reduce((acc, d) => acc + (d.valor_previsto || 0), 0);
  
  const totalPago = validDespesas
    .filter((d) => d.status === "paga")
    .reduce((acc, d) => acc + (d.valor_pago || d.valor_previsto || 0), 0);
    
  const totalPendente = validDespesas
    .filter((d) => d.status === "pendente" || d.status === "atrasada")
    .reduce((acc, d) => acc + (d.valor_previsto || 0), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Skeleton className="h-32 rounded-xl bg-surface border-border" />
        <Skeleton className="h-32 rounded-xl bg-surface border-border" />
        <Skeleton className="h-32 rounded-xl bg-surface border-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Previsto */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between overflow-hidden relative">
        <div className="flex items-center gap-3 mb-2 z-10">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="text-muted font-medium">Total Previsto</span>
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-foreground">-US$ {formatCurrency(totalPrevisto).replace("US$", "").trim()}</h2>
        </div>
      </div>

      {/* Total Pago */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between overflow-hidden relative group">
        <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors duration-300" />
        {/* Glow effect */}
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-3 mb-2 z-10">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-muted font-medium">Total Pago</span>
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-rose-400">-US$ {formatCurrency(totalPago).replace("US$", "").trim()}</h2>
        </div>
      </div>

      {/* Total Pendente */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between overflow-hidden relative">
        <div className="flex items-center gap-3 mb-2 z-10">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-muted font-medium">Total Pendente</span>
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-amber-400">-US$ {formatCurrency(totalPendente).replace("US$", "").trim()}</h2>
        </div>
      </div>
    </div>
  );
}
