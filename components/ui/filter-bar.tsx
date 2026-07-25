import * as React from "react";
import { SearchInput } from "./search-input";
import { Button } from "./button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar por descrição, categoria...",
  filters,
  actions,
  onClearFilters,
  hasActiveFilters = false,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-[#111827] border border-border/80 shadow-md",
        className
      )}
    >
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="w-full sm:w-72 md:w-80">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </Button>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
