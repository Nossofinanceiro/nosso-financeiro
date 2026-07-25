import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  familia: {
    all: ["familia"] as const,
    atual: () => [...queryKeys.familia.all, "atual"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    resumo: (mes?: string) => [...queryKeys.dashboard.all, "resumo", mes || "atual"] as const,
  },
  contas: {
    all: ["contas"] as const,
    lista: (familiaId?: string) => [...queryKeys.contas.all, "lista", familiaId || "none"] as const,
    detalhe: (id: string) => [...queryKeys.contas.all, "detalhe", id] as const,
  },
  receitas: {
    all: ["receitas"] as const,
    mes: (familiaId?: string, mes?: string) =>
      [...queryKeys.receitas.all, "mes", familiaId || "none", mes || "atual"] as const,
    details: (id: string) => ["receitas", "detail", id] as const,
  },
  despesas: {
    all: ["despesas"] as const,
    mes: (familiaId?: string, mes?: string) =>
      [...queryKeys.despesas.all, "mes", familiaId || "none", mes || "atual"] as const,
    pendentes: (familiaId?: string) =>
      [...queryKeys.despesas.all, "pendentes", familiaId || "none"] as const,
  },
  categorias: {
    all: ["categorias"] as const,
    lista: (familiaId?: string) => [...queryKeys.categorias.all, "lista", familiaId || "none"] as const,
  },
  cartoes: {
    all: ["cartoes"] as const,
    lista: (familiaId?: string) => [...queryKeys.cartoes.all, "lista", familiaId || "none"] as const,
  },
  transferencias: {
    all: ["transferencias"] as const,
    lista: (familiaId?: string) => [...queryKeys.transferencias.all, "lista", familiaId || "none"] as const,
  },
  metas: {
    all: ["metas"] as const,
    lista: (familiaId?: string) => [...queryKeys.metas.all, "lista", familiaId || "none"] as const,
  },
  orcamentos: {
    all: ["orcamentos"] as const,
    mes: (familiaId?: string, mes?: string) =>
      [...queryKeys.orcamentos.all, "mes", familiaId || "none", mes || "atual"] as const,
  },
  recorrencias: {
    all: ["recorrencias"] as const,
    lista: (familiaId?: string) => [...queryKeys.recorrencias.all, "lista", familiaId || "none"] as const,
  },
} as const;

// Cache Invalidation Helpers for Future Mutations
export async function invalidateDashboard(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export async function invalidateAccounts(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.contas.all });
  await invalidateDashboard(queryClient);
}

export async function invalidateIncomes(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.receitas.all });
  await invalidateDashboard(queryClient);
  await invalidateAccounts(queryClient);
}

export async function invalidateExpenses(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.despesas.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.orcamentos.all });
  await invalidateDashboard(queryClient);
  await invalidateAccounts(queryClient);
}

export async function invalidateCategories(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.categorias.all });
}
