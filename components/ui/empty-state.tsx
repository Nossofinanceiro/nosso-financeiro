import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-surface/40 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-secondary/80 text-muted border border-border-subtle/50">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
