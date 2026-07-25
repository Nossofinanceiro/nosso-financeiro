"use client";

import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileNavigation } from "./mobile-navigation";
import { BottomNavigation } from "./bottom-navigation";
import { Fab } from "./fab";
import { useDeviceType } from "@/hooks/use-media-query";

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  onQuickAction?: () => void;
}

export function AppShell({ children, title, onQuickAction }: AppShellProps) {
  const { isTablet } = useDeviceType();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isCollapsed = collapsed || isTablet;

  return (
    <div className="flex h-screen overflow-hidden bg-[#090d16] text-gray-100 antialiased">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar
          collapsed={isCollapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Menu Drawer (Fallback) */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AppHeader
          title={title}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          onQuickAction={onQuickAction}
        />

        {/* Content with bottom safe area offset on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile-Only Bottom Navigation & FAB */}
        <Fab />
        <BottomNavigation />
      </div>
    </div>
  );
}
