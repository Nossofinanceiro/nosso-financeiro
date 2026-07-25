"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from "@/constants";
import { MoreHorizontal, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isMoreActive = MORE_NAV_ITEMS.some((item) => item.href === pathname);

  return (
    <>
      {/* Drawer para o menu "Mais" */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet menu */}
          <div className="relative w-full bg-surface border-t border-border rounded-t-3xl shadow-2xl z-10 overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200 pb-safe">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-bold text-base text-foreground">Outros Módulos</span>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Fechar menu"
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
              {MORE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-background border-border text-muted hover:bg-surface-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior (Mobile Fixa) */}
      <nav
        aria-label="Navegação inferior mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 border-t border-border backdrop-blur-lg px-2 pb-safe pt-1 flex items-center justify-around shadow-2xl select-none"
      >
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] touch-target rounded-xl transition-all relative",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] tracking-tight mt-1">{item.title}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Botão "Mais" */}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] touch-target rounded-xl transition-all relative cursor-pointer",
            isMoreActive
              ? "text-primary font-semibold"
              : "text-muted hover:text-foreground"
          )}
        >
          <MoreHorizontal className={cn("w-5 h-5 transition-transform", isMoreActive && "scale-110")} />
          <span className="text-[10px] tracking-tight mt-1">Mais</span>
          {isMoreActive && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
      </nav>
    </>
  );
}
