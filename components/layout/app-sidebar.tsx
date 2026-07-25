"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  { title: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { title: "Receitas", href: "/receitas", icon: TrendingUp },
  { title: "Despesas", href: "/despesas", icon: TrendingDown },
  { title: "Contas", href: "/contas", icon: Wallet },
  { title: "Cartões", href: "/cartoes", icon: CreditCard },
  { title: "Planejamento", href: "/planejamento", icon: CalendarCheck },
  { title: "Metas", href: "/metas", icon: Target },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];

export interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: () => void;
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  onItemClick,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = React.useState<string>("Usuário");
  const [userEmail, setUserEmail] = React.useState<string>("");

  React.useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserName(
          user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "Usuário"
        );
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface border-r border-border transition-all duration-300 h-full select-none",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Top Branding */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-border shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden"
          onClick={onItemClick}
        >
          {!collapsed ? (
            <>
              <img src="/logo2.png" alt="Nosso Financeiro" className="h-12 object-contain dark:hidden" />
              <img src="/logo.png" alt="Nosso Financeiro" className="h-12 object-contain hidden dark:block" />
            </>
          ) : (
            <>
              <img src="/logo2.png" alt="NF" className="h-12 w-12 object-cover object-left dark:hidden" />
              <img src="/logo.png" alt="NF" className="h-12 w-12 object-cover object-left hidden dark:block" />
            </>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="hidden md:flex p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-2 pb-1.5">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Navegação
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 px-3 h-[44px] rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                  : "text-muted hover:text-foreground hover:bg-surface-secondary"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted group-hover:text-foreground"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {/* Separator & Design System Link */}
        <div className="pt-3 pb-1.5 px-2">
          <div className="h-[1px] bg-border mb-2" />
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
              Desenvolvimento
            </p>
          )}
        </div>

        <Link
          href="/design-system"
          onClick={onItemClick}
          title={collapsed ? "Design System" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 h-[44px] rounded-lg text-sm font-medium transition-all group",
              pathname === "/design-system"
                ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                : "text-muted hover:text-foreground hover:bg-surface-secondary"
          )}
        >
          <Palette className="w-4 h-4 shrink-0 text-primary" />
          {!collapsed && <span>Design System</span>}
        </Link>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted truncate">
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted hover:bg-surface-secondary hover:text-danger transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
