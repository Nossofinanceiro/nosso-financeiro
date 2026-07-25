import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const statCardVariants = cva(
  "rounded-2xl border p-5 transition-all shadow-lg flex flex-col justify-between space-y-3",
  {
    variants: {
      variant: {
        positive: "bg-surface border-primary/30 text-primary",
        negative: "bg-surface border-danger/30 text-danger",
        neutral: "bg-surface border-border/80 text-foreground",
        highlight: "bg-emerald-950/40 border-primary/40 text-primary shadow-emerald-950/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: number; // Raw numeric value
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNegative?: boolean;
  };
  description?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  variant = "neutral",
  className,
  ...props
}: StatCardProps) {
  const isPositiveVal = value > 0;
  const isNegativeVal = value < 0;

  const valueColor = {
    positive: "text-primary",
    negative: "text-danger",
    neutral: isPositiveVal
      ? "text-primary"
      : isNegativeVal
      ? "text-danger"
      : "text-foreground",
    highlight: "text-primary",
  }[variant || "neutral"];

  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-surface-secondary/60 border border-border-subtle/40 text-foreground">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className={cn("text-2xl font-bold tracking-tight font-mono", valueColor)}>
          {formatCurrency(value)}
        </div>

        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded",
                  trend.isPositive && "bg-primary/10 text-primary",
                  trend.isNegative && "bg-danger/10 text-danger",
                  !trend.isPositive && !trend.isNegative && "bg-surface-secondary text-muted"
                )}
              >
                {trend.isPositive && <TrendingUp className="w-3 h-3" />}
                {trend.isNegative && <TrendingDown className="w-3 h-3" />}
                {!trend.isPositive && !trend.isNegative && <Minus className="w-3 h-3" />}
                <span>{trend.value}</span>
              </span>
            )}
            {description && (
              <span className="text-muted truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
