"use client";

import * as React from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandGroup {
  category: string;
  items: {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    href?: string;
    onSelect?: () => void;
  }[];
}

export interface CommandMenuProps {
  groups: CommandGroup[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandMenu({ groups, isOpen: externalOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClose = React.useCallback(() => {
    if (onClose) onClose();
    else setInternalOpen(false);
    setQuery("");
  }, [onClose]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) handleClose();
        else {
          if (onClose) onClose();
          else setInternalOpen(true);
        }
      } else if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, onClose]);

  if (!isOpen) return null;

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(query.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search header */}
        <div className="flex items-center px-4 border-b border-gray-800/80">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando ou busque (ex: Receitas)..."
            className="w-full bg-transparent border-none text-white placeholder-gray-500 px-3 py-4 text-sm focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleClose}
            aria-label="Fechar menu de comandos"
            className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Nenhum comando encontrado para &quot;{query}&quot;.
            </div>
          ) : (
            filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {group.category}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleClose();
                      if (item.href) router.push(item.href);
                      item.onSelect?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.icon && <span className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 shrink-0">{item.icon}</span>}
                      <div className="text-left min-w-0">
                        <p className="font-medium text-white truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2 bg-gray-950/60 border-t border-gray-800/80 text-[11px] text-gray-500 flex items-center justify-between">
          <span>Use as setas para navegar</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300 font-mono text-[10px]">ESC</kbd> para fechar
          </span>
        </div>
      </div>
    </div>
  );
}
