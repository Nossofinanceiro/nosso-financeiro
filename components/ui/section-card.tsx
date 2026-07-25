import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  footer,
  className,
  ...props
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-[#111827] shadow-xl overflow-hidden flex flex-col",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-background/40 border-t border-border/60 flex items-center justify-end">
          {footer}
        </div>
      )}
    </div>
  );
}
