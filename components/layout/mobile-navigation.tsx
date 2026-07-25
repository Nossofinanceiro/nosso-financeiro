"use client";

import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { X } from "lucide-react";

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-gray-900 h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute top-4 right-4 z-20 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AppSidebar onItemClick={onClose} />
      </div>
    </div>
  );
}
