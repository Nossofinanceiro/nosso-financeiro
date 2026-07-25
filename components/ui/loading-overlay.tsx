import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Carregando...",
  fullPage = false,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity p-4",
        fullPage ? "fixed inset-0" : "absolute inset-0 rounded-xl",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 p-6 bg-surface border border-border rounded-2xl shadow-2xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
