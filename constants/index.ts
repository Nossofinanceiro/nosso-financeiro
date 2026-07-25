import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  CalendarCheck,
  Target,
  BarChart3,
  Settings,
  Palette,
  PlusCircle,
  ArrowLeftRight,
} from "lucide-react";

export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  desktopMin: 1024,
} as const;

export const MAIN_NAV_ITEMS = [
  { title: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { title: "Receitas", href: "/receitas", icon: TrendingUp },
  { title: "Despesas", href: "/despesas", icon: TrendingDown },
  { title: "Contas", href: "/contas", icon: Wallet },
] as const;

export const MORE_NAV_ITEMS = [
  { title: "Cartões", href: "/cartoes", icon: CreditCard },
  { title: "Planejamento", href: "/planejamento", icon: CalendarCheck },
  { title: "Metas", href: "/metas", icon: Target },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
  { title: "Design System", href: "/design-system", icon: Palette },
] as const;

export const FAB_ACTIONS = [
  { id: "nova-receita", label: "Nova Receita", type: "receita", icon: TrendingUp, color: "text-emerald-400" },
  { id: "nova-despesa", label: "Nova Despesa", type: "despesa", icon: TrendingDown, color: "text-red-400" },
  { id: "transferencia", label: "Transferência", type: "transferencia", icon: ArrowLeftRight, color: "text-blue-400" },
  { id: "adicionar-conta", label: "Adicionar Conta", type: "conta", icon: PlusCircle, color: "text-amber-400" },
] as const;
