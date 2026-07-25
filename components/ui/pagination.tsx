import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Navegação por páginas"
      className={cn("flex items-center justify-between gap-2 py-3", className)}
    >
      <div className="text-xs text-muted">
        Página <span className="font-semibold text-foreground">{currentPage}</span> de{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          aria-label="Página anterior"
          className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((num, idx) => (
          <React.Fragment key={idx}>
            {typeof num === "number" ? (
              <button
                onClick={() => onPageChange(num)}
                disabled={disabled}
                className={cn(
                  "min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  currentPage === num
                    ? "bg-primary text-foreground font-semibold shadow-md"
                    : "bg-surface border border-border text-foreground hover:bg-surface-secondary hover:text-foreground"
                )}
              >
                {num}
              </button>
            ) : (
              <span className="px-1 text-muted text-xs select-none">...</span>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
          aria-label="Próxima página"
          className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
