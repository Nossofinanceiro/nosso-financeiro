import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "pending" | "delayed" | "cancelled" | "neutral";

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      color: "bg-primary",
      text: "text-primary",
      defaultLabel: "Concluído",
    },
    pending: {
      color: "bg-amber-500",
      text: "text-amber-400",
      defaultLabel: "Pendente",
    },
    delayed: {
      color: "bg-rose-500",
      text: "text-rose-400",
      defaultLabel: "Atrasado",
    },
    cancelled: {
      color: "bg-gray-500",
      text: "text-muted",
      defaultLabel: "Cancelado",
    },
    neutral: {
      color: "bg-blue-500",
      text: "text-blue-400",
      defaultLabel: "Neutro",
    },
  }[status];

  const displayLabel = label || statusConfig.defaultLabel;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            statusConfig.color
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            statusConfig.color
          )}
        />
      </span>
      <span className={cn("text-xs font-semibold tracking-wide", statusConfig.text)}>
        {displayLabel}
      </span>
    </div>
  );
}
